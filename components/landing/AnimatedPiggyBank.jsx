'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

function PiggyBankModel() {
  const bodyRef = useRef();
  const innerCoreRef = useRef();
  const coinRef = useRef();

  // Animation logic
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Floating effect
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 0.8) * 0.1;
      bodyRef.current.rotation.y = t * 0.15;
      bodyRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }

    // Inner core pulse
    if (innerCoreRef.current) {
      innerCoreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
      innerCoreRef.current.material.emissiveIntensity = 15 + Math.sin(t * 2) * 1;
    }

    // Coin drop animation
    if (coinRef.current) {
      const cycle = (t * 0.4) % 4; // 4 second cycle
      if (cycle < 1.2) {
        // Falling
        coinRef.current.position.y = 1.8 - (cycle / 1.2) * 0.8;
        coinRef.current.material.opacity = Math.min(cycle * 3, 1);
        coinRef.current.scale.setScalar(1);
      } else if (cycle < 1.5) {
        // Disappearing into slot
        coinRef.current.position.y = 1.0;
        coinRef.current.material.opacity = 1 - (cycle - 1.2) / 0.3;
        coinRef.current.scale.setScalar(1 - (cycle - 1.2) / 0.3);
      } else {
        // Reset/Hide
        coinRef.current.position.y = 3; 
        coinRef.current.material.opacity = 0;
      }
    }
  });

  // Material for the glass body
  const glassMaterial = (
    <meshPhysicalMaterial
      transmission={0.98}
      thickness={1.2}
      roughness={0.02}
      envMapIntensity={1.5}
      clearcoat={1}
      clearcoatRoughness={0.01}
      color="#c7f9ff"
      attenuationDistance={0.5}
      attenuationColor="#ffffff"
      ior={1.5}
    />
  );

  return (
    <group>
      {/* Main Body Group */}
      <group ref={bodyRef}>
        {/* Piggy Body - Ellipsoid */}
        <mesh scale={[1.3, 1, 1]}>
          <sphereGeometry args={[1, 64, 64]} />
          {glassMaterial}
        </mesh>

        {/* Head - Slightly forward */}
        <mesh position={[0.9, 0.2, 0]} scale={[0.65, 0.65, 0.65]}>
          <sphereGeometry args={[1, 64, 64]} />
          {glassMaterial}
        </mesh>

        {/* Snout */}
        <mesh position={[1.4, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.2, 0.3, 0.3]}>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          {glassMaterial}
        </mesh>

        {/* Ears - Rounded Capsules */}
        <mesh position={[1.0, 0.7, 0.35]} rotation={[-0.3, 0, -0.5]}>
          <capsuleGeometry args={[0.12, 0.2, 4, 16]} />
          {glassMaterial}
        </mesh>
        <mesh position={[1.0, 0.7, -0.35]} rotation={[0.3, 0, -0.5]}>
          <capsuleGeometry args={[0.12, 0.2, 4, 16]} />
          {glassMaterial}
        </mesh>

        {/* Legs - Short stubs */}
        <mesh position={[0.6, -0.8, 0.5]}>
          <cylinderGeometry args={[0.18, 0.12, 0.5, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[0.6, -0.8, -0.5]}>
          <cylinderGeometry args={[0.18, 0.12, 0.5, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[-0.6, -0.8, 0.5]}>
          <cylinderGeometry args={[0.18, 0.12, 0.5, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[-0.6, -0.8, -0.5]}>
          <cylinderGeometry args={[0.18, 0.12, 0.5, 32]} />
          {glassMaterial}
        </mesh>

        {/* Tail - Subtle curl */}
        <mesh position={[-1.25, 0.2, 0]} rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[0.12, 0.04, 16, 32, Math.PI * 1.6]} />
          {glassMaterial}
        </mesh>

        {/* Internal Glowing Core - The "AI/Wealth Energy" */}
        <mesh ref={innerCoreRef}>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial
            emissive="#00ffd9"
            emissiveIntensity={15}
            color="#00ffd9"
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Dedicated Internal Light for that neon pop */}
        <pointLight position={[0, 0, 0]} intensity={20} color="#00ffd9" distance={3} />

        {/* Coin Slot Slit - Subtly visible */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.55, 0.02, 0.12]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Falling Gold Coin */}
      <mesh ref={coinRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 32]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={1.2} 
          metalness={1} 
          roughness={0.1}
          transparent
        />
      </mesh>

      {/* Ambient Neon Glow Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color="#14b8a6" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

export default function AnimatedPiggyBank() {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-auto">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] pointer-none" />

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ReinhardToneMapping }}
        className="z-10"
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={35} />
          
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Stage
              intensity={0.4}
              environment="city"
              adjustCamera={false}
              shadows={{ type: 'contact', opacity: 0.3, blur: 3 }}
            >
              <PiggyBankModel />
            </Stage>
          </Float>

          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate
            autoRotateSpeed={0.5}
          />

          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#00ffff" />
          <pointLight position={[-5, 5, 5]} intensity={1.5} color="#00ffaa" />
          <pointLight position={[0, -5, 5]} intensity={1} color="#0066ff" />
          <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" castShadow />
          
          <ContactShadows 
            position={[0, -1.8, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2.5} 
            far={4.5} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
