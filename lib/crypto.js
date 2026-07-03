import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync(process.env.JWT_SECRET || 'fallback_secret', 'salt', 32);

export function encryptEmbedding(embedding) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    // Convert float array to buffer for encryption
    const data = Buffer.from(new Float32Array(embedding).buffer);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
        iv: iv.toString('hex'),
        data: encrypted.toString('hex')
    };
}

export function decryptEmbedding(encryptedObj) {
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const encryptedData = Buffer.from(encryptedObj.data, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Convert buffer back to float array
    return Array.from(new Float32Array(decrypted.buffer));
}
