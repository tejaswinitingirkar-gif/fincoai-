'use client';

import React from 'react';

const SavingAnimation = ({ size = 200 }) => {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible'
    }}>
      {/* Background Glow */}
      <div style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%', 
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        zIndex: 0
      }}></div>

      {/* Piggy Bank Body (Larger version of logo) */}
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="saving-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="85" rx="30" ry="5" fill="rgba(0,0,0,0.3)" />

        {/* Body */}
        <path 
          d="M25 45C25 33.9543 33.9543 25 45 25H65C76.0457 25 85 33.9543 85 45V60C85 71.0457 76.0457 80 65 80H45C33.9543 80 25 71.0457 25 60V45Z" 
          fill="url(#saving-grad)" 
        />
        
        {/* Snout */}
        <path d="M15 50C15 47.7909 16.7909 46 19 46H25V64H19C16.7909 64 15 62.2091 15 60V50Z" fill="url(#saving-grad)" />

        {/* Coin Slot */}
        <rect x="45" y="35" width="20" height="4" rx="2" fill="white" fillOpacity="0.8" />

        {/* Legs */}
        <rect x="35" y="80" width="10" height="5" rx="2" fill="url(#saving-grad)" />
        <rect x="65" y="80" width="10" height="5" rx="2" fill="url(#saving-grad)" />

        {/* Falling Coins */}
        {[0, 1, 2].map((i) => (
          <g key={i} style={{ animation: `coin-drop 3s infinite ${i * 1}s cubic-bezier(0.4, 0, 0.2, 1)` }}>
             <circle cx="55" cy="15" r="5" fill="#facc15" />
             <path d="M52 15L58 15" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SavingAnimation;
