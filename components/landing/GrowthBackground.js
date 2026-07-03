'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

/**
 * Clean Fintech Background
 * - Pure dark navy gradient base
 * - Subtle ambient radial glows
 * - Minimal floating depth particles
 */
export default function GrowthBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: `${(i * 7.7 + 13.3) % 100}%`,
      y: `${(i * 12.3 + 47.7) % 100}%`,
      opacity: 0.05 + (i % 5) * 0.01,
      duration: 15 + (i % 7) * 1.5,
      delay: (i % 4) * 3
    }));
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-[#05070D]" />;

  return (
    <div className="fixed inset-0 z-0 bg-[#05070D] overflow-hidden pointer-events-none">
      
      {/* Base Gradient Layers */}
      <div className="absolute inset-0 bg-[#05070D]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0A0F1F_0%,#05070D_100%)]" />
      
      {/* Subtle Ambient Radial Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[120px] opacity-40 animate-pulse" 
           style={{ animationDelay: '2s' }} />

      {/* Minimal Floating Depth Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: p.x, 
            y: p.y, 
            opacity: p.opacity 
          }}
          animate={{ 
            y: ['-10%', '110%'],
            opacity: [0, 0.2, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: p.delay
          }}
          className="absolute w-[2px] h-[2px] bg-white rounded-full blur-[1px]"
        />
      ))}

    </div>
  );
}
