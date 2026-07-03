import numpy as np
import base64
import cv2
import os
import urllib.request
from typing import List

# ─── Constants ─────────────────────────────────────────────────────────────────
EMBEDDING_DIM = 512
SIMILARITY_THRESHOLD = 0.60
MIN_BLUR_SCORE = 30.0
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# ArcFace ONNX model (MobileNet backbone, 512-d, no TF needed)
ARCFACE_MODEL_URL = "https://github.com/onnx/models/raw/main/validated/vision/body_analysis/arcface/model/arcfaceresnet100-8.onnx"
ARCFACE_MODEL_PATH = os.path.join(MODELS_DIR, 'arcface_resnet100.onnx')

# OpenCV DNN face detector (ships with opencv-python)
FACE_PROTO = os.path.join(MODELS_DIR, 'deploy.prototxt')
FACE_MODEL = os.path.join(MODELS_DIR, 'res10_300x300_ssd_iter_140000.caffemodel')
FACE_DETECTOR_PROTO_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
FACE_DETECTOR_MODEL_URL = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"

# ─── InsightFace Singleton ──────────────────────────────────────────────────────
_insightface_app = None

def _get_insightface():
    """Load InsightFace Buffalo_L (singleton)."""
    global _insightface_app
    if _insightface_app is not None:
        return _insightface_app

    from insightface.app import FaceAnalysis
    # buffalo_l includes: det_10g, w600k_r50, genderage
    app = FaceAnalysis(name='buffalo_l', root=MODELS_DIR, providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    _insightface_app = app
    print("[FaceAPI] InsightFace Buffalo_L loaded.")
    return _insightface_app


# ─── Image utilities ────────────────────────────────────────────────────────────

def _decode_frame(b64_string: str) -> np.ndarray:
    """Decode a base64 image string to BGR numpy array."""
    if ',' in b64_string:
        b64_string = b64_string.split(',')[1]
    img_data = base64.b64decode(b64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image frame.")
    return img


def _check_quality(img: np.ndarray):
    """Run quality checks. Returns dict with issues list."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness = float(np.mean(gray))
    
    # ── Anti-Spoofing: Frequency Analysis (Detect Screen Moiré) ──
    dft = np.fft.fft2(gray)
    dft_shift = np.fft.fftshift(dft)
    magnitude_spectrum = 20 * np.log(np.abs(dft_shift) + 1)
    moiré_detected = np.std(magnitude_spectrum) > 50.0 

    issues = []
    if blur_score < MIN_BLUR_SCORE:
        issues.append(f"blurry")
    if brightness < 30:
        issues.append("too dark")
    if brightness > 230:
        issues.append("overexposed")
    if moiré_detected:
        issues.append("screen/spoof detected")
        
    return issues, blur_score, brightness


# ─── Public API ─────────────────────────────────────────────────────────────────

def process_frames(frames_base64: List[str]) -> List[float]:
    """
    Process frames using InsightFace Buffalo_L:
      1. Quality & Liveness checks
      2. InsightFace detection & 512-d embedding
      3. Average across frames
    """
    app = _get_insightface()

    valid_embeddings = []
    decoded_imgs = []
    frame_errors = []

    for idx, b64 in enumerate(frames_base64):
        frame_label = f"Frame {idx + 1}"
        try:
            img = _decode_frame(b64)
            decoded_imgs.append(img)
            issues, _, _ = _check_quality(img)
            if issues:
                frame_errors.append(f"{frame_label}: {', '.join(issues)}")
                continue

            # InsightFace Detection & Embedding
            faces = app.get(img)
            
            if len(faces) == 0:
                frame_errors.append(f"{frame_label}: no face detected")
                continue
            if len(faces) > 1:
                frame_errors.append(f"{frame_label}: multiple faces detected")
                continue

            emb = faces[0].embedding # 512-d
            # L2 normalize
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm
            
            valid_embeddings.append(emb)

        except Exception as e:
            frame_errors.append(f"{frame_label}: {str(e)}")

    if len(valid_embeddings) < 2:
        detail = "; ".join(frame_errors) if frame_errors else "Insufficient valid frames."
        raise ValueError(f"Biometric scan failed. {detail}")

    # ── Liveness: Temporal Variance (Movement Check) ──
    diffs = []
    for i in range(len(decoded_imgs) - 1):
        diff = cv2.absdiff(decoded_imgs[i], decoded_imgs[i+1])
        diffs.append(np.mean(diff))
    
    avg_diff = np.mean(diffs)
    if avg_diff < 0.8: # Calibrated for InsightFace stability
        raise ValueError("Liveness check failed: Static image detected. Please move naturally.")
    
    # Average multi-frame embeddings and re-normalize
    avg = np.mean(valid_embeddings, axis=0).astype(np.float32)
    norm = np.linalg.norm(avg)
    if norm > 0:
        avg = avg / norm

    return avg.tolist()


def compare_embeddings(emb1: List[float], emb2: List[float]) -> float:
    """
    Cosine similarity between two L2-normalized 512-d embeddings.
    Both must be exactly 512 dimensions.
    """
    a = np.array(emb1, dtype=np.float32)
    b = np.array(emb2, dtype=np.float32)

    if len(a) != EMBEDDING_DIM or len(b) != EMBEDDING_DIM:
        raise ValueError(
            f"Embedding dimension mismatch: stored={len(b)}, live={len(a)}. "
            "Re-registration required."
        )

    # Dot product of already-normalized vectors = cosine similarity
    similarity = float(np.dot(a, b))
    return float(np.clip(similarity, -1.0, 1.0))
