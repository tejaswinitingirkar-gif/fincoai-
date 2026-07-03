'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import PiggyBankModel from './PiggyBankModel';

export default function PiggyBank() {
  return (
    <div className="w-full h-[500px] md:h-[600px] relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          <Stage
            intensity={0.5}
            environment="city"
            adjustCamera={false}
            shadows={{ type: 'contact', opacity: 0.2, blur: 2 }}
          >
            <PiggyBankModel />
          </Stage>

          <PerspectiveCamera makeDefault position={[3, 2, 5]} />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />

          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00ffcc" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
          
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4.5} 
          />
        </Suspense>
      </Canvas>

      {/* Background Glow Effect (CSS fallback/enhancement) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />
    </div>
  );
}
