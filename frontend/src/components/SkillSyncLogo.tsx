import React from 'react';

const SkillSyncLogo: React.FC<{ size?: number; className?: string }> = ({ size = 46, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="bgGradient" x1="64" y1="64" x2="448" y2="448">
        <stop offset="0%" stopColor="#4F46E5"/>
        <stop offset="100%" stopColor="#06B6D4"/>
      </linearGradient>

      <linearGradient id="linkGradient" x1="140" y1="140" x2="372" y2="372">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#E0F2FE"/>
      </linearGradient>

      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.15"/>
      </filter>
    </defs>

    {/* Background */}
    <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#bgGradient)" filter="url(#shadow)"/>

    {/* Connection Nodes */}
    <circle cx="176" cy="176" r="28" fill="white"/>
    <circle cx="336" cy="176" r="28" fill="white"/>
    <circle cx="176" cy="336" r="28" fill="white"/>
    <circle cx="336" cy="336" r="28" fill="white"/>

    {/* Connecting Paths */}
    <path d="M204 176H308" stroke="url(#linkGradient)" strokeWidth="18" strokeLinecap="round"/>
    <path d="M176 204V308" stroke="url(#linkGradient)" strokeWidth="18" strokeLinecap="round"/>
    <path d="M336 204V308" stroke="url(#linkGradient)" strokeWidth="18" strokeLinecap="round"/>
    <path d="M204 336H308" stroke="url(#linkGradient)" strokeWidth="18" strokeLinecap="round"/>

    {/* Central Sync Hub */}
    <circle cx="256" cy="256" r="44" fill="white"/>
    <path d="M238 256C238 246 246 238 256 238C266 238 274 246 274 256" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round"/>
    <path d="M274 256C274 266 266 274 256 274C246 274 238 266 238 256" stroke="#06B6D4" strokeWidth="10" strokeLinecap="round"/>

    {/* SkillSync Text */}
    <text 
      x="256" 
      y="435" 
      textAnchor="middle" 
      fontFamily="Inter, Arial, sans-serif" 
      fontSize="64" 
      fontWeight="800" 
      fill="white"
      letterSpacing="2"
    >
      SkillSync
    </text>
  </svg>
);

export default SkillSyncLogo;
