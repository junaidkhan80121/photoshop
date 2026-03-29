import React from 'react';
import { Box } from '@mui/material';
import './ToneCurve.css';

export default function ToneCurve({ darkMode }) {
  return (
    <Box className={`tone-curve ${darkMode ? 'dark' : 'light'}`}>
      <svg viewBox="0 0 200 200" className="tone-curve-svg">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" />
        
        {/* Diagonal reference line */}
        <line 
          x1="0" y1="200" 
          x2="200" y2="0" 
          stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
          strokeWidth="1" 
          strokeDasharray="4,4"
        />
        
        {/* Curve path */}
        <path
          d="M 0,180 Q 50,160 80,120 T 140,50 T 200,20"
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        
        {/* Control points */}
        <circle cx="80" cy="120" r="5" fill="#a78bfa" className="control-point" />
        <circle cx="140" cy="50" r="5" fill="#f472b6" className="control-point" />
        
        {/* Glow effect for curve */}
        <path
          d="M 0,180 Q 50,160 80,120 T 140,50 T 200,20"
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          filter="blur(4px)"
        />
      </svg>
    </Box>
  );
}
