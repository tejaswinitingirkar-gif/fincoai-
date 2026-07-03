'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Advanced AI-Powered Fintech Background
 * Features:
 * - Dynamic moving gradient base
 * - AI Neural Network lines (Canvas)
 * - Subtle geometric grid
 * - Floating ambient particles
 */

// Particle class defined outside component to satisfy React purity rules
class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.radius = Math.random() * 1.5 + 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
    ctx.fill();
  }
}

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = [];
    const particleCount = 40;
    const connectionDistance = 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.update();
        p.draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(79, 70, 229, ${0.1 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#05070D] overflow-hidden pointer-events-none">
      {/* 1. Moving Gradient Base */}
      <div 
        className="absolute inset-0 opacity-40 animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #0A0F1F 0%, #05070D 100%)',
          animation: 'gradient-move 20s ease infinite alternate'
        }}
      />

      {/* 2. Geometric Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* 3. AI Neural Network (Canvas) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 opacity-60"
      />

      {/* 4. Ambient Glow Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[120px] animate-float-slow-reverse" />

      <style jsx global>{`
        @keyframes gradient-move {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(2%, 2%); }
        }
        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(5%, 5%) rotate(5deg); }
        }
        @keyframes float-slow-reverse {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-5%, -5%) rotate(-5deg); }
        }
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
