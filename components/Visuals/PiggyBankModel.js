'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function PiggyBankModel() {
  const bodyRef = useRef();
  const innerCoreRef = useRef();
  const coinRef = useRef();

  // Animation logic
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Floating effect
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 0.8) * 0.1;
      bodyRef.current.rotation.y = t * 0.2;
      bodyRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }

    // Inner core pulse
    if (innerCoreRef.current) {
      innerCoreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
      innerCoreRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5;
    }

    // Coin drop animation
    if (coinRef.current) {
      const cycle = (t * 0.5) % 3; // 3 second cycle
      if (cycle < 1) {
        coinRef.current.position.y = 1.5 - cycle * 1.5;
        coinRef.current.material.opacity = cycle * 2;
      } else {
        coinRef.current.position.y = 2; // Hide
        coinRef.current.material.opacity = 0;
      }
    }
  });

  // Materials
  const glassMaterial = (
    <meshPhysicalMaterial
      transmission={0.95}
      thickness={0.5}
      roughness={0.05}
      envMapIntensity={1}
      clearcoat={1}
      clearcoatRoughness={0}
      color="#ffffff"
      attenuationDistance={0.5}
      attenuationColor="#ffffff"
    />
  );

  return (
    <group>
      {/* Main Body Group */}
      <group ref={bodyRef}>
        {/* Piggy Body */}
        <mesh scale={[1.2, 1, 1]}>
          <sphereGeometry args={[1, 64, 64]} />
          {glassMaterial}
        </mesh>

        {/* Head */}
        <mesh position={[1, 0.2, 0]} scale={[0.6, 0.6, 0.6]}>
          <sphereGeometry args={[1, 32, 32]} />
          {glassMaterial}
        </mesh>

        {/* Snout */}
        <mesh position={[1.5, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.2, 0.3, 0.3]}>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          {glassMaterial}
        </mesh>

        {/* Ears */}
        <mesh position={[1.1, 0.7, 0.3]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.2, 0.4, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[1.1, 0.7, -0.3]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.2, 0.4, 32]} />
          {glassMaterial}
        </mesh>

        {/* Legs */}
        <mesh position={[0.5, -0.8, 0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[0.5, -0.8, -0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[-0.5, -0.8, 0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
          {glassMaterial}
        </mesh>
        <mesh position={[-0.5, -0.8, -0.5]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
          {glassMaterial}
        </mesh>

        {/* Tail (Simple curl) */}
        <mesh position={[-1.2, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.1, 0.03, 16, 32, Math.PI * 1.5]} />
          {glassMaterial}
        </mesh>

        {/* Internal Glowing Core */}
        <mesh ref={innerCoreRef}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            emissive="#00ffcc"
            emissiveIntensity={2}
            color="#00ffcc"
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Coin Slot Slit */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.1]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Floating Coin */}
      <mesh ref={coinRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.5} 
          metalness={1} 
          roughness={0.1}
          transparent
        />
      </mesh>

      {/* Subtle Glow Ring around the pig */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <torusGeometry args={[1.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
