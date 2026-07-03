'use client';

import React from 'react';
import { motion } from 'framer-motion';

const BrandLogo = ({ size = 40, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-[#3B82F6]/20 blur-xl rounded-xl -z-10 animate-pulse"></div>
      
      {/* Logo Container with Glassmorphism */}
      <div className="relative w-full h-full rounded-[28%] overflow-hidden bg-[#0A0F1F] border border-white/10 shadow-2xl flex items-center justify-center group transform-gpu transition-all duration-500">
        
        {/* Modern Multi-stop Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#14B8A6] via-[#3B82F6] to-[#7C3AED] opacity-85 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Secondary Inner Gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>

        {/* Animated Shimmer Sweep */}
        <motion.div 
          animate={{ x: ['-250%', '250%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[25deg] z-10"
        />

        {/* Precision Geometric Icon (Simplified Piggy Concept) */}
        <svg 
          width="55%" 
          height="55%" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-20 text-white drop-shadow-lg"
        >
          {/* Main Body - Geometric Circle */}
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" />
          
          {/* Snout - Sharp geometric accent */}
          <path d="M19 12H21C21.5523 12 22 12.4477 22 13V15C22 15.5523 21.5523 16 21 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          
          {/* Coin Slot - Clean horizontal line */}
          <path d="M9 10H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Ear - Triangle accent */}
          <path d="M15 5L17 3L18 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          
          {/* Tail - Minimalist curve */}
          <path d="M5 13C4 13 3 14 3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Inner highlights */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/20 rounded-full blur-[1px]"></div>
      </div>
    </div>
  );
};

export default BrandLogo;
