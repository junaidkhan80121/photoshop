import React from 'react';
import { Box } from '@mui/material';
import './ToneCurve.css';

export default function ToneCurve({ darkMode }) {
  const stroke = darkMode ? '#ffffff' : '#000000';
  const grid = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const refLine = darkMode ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)';

  return (
    <Box className={`tone-curve ${darkMode ? 'dark' : 'light'}`}>
      <svg viewBox="0 0 200 200" className="tone-curve-svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={grid} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" />

        <line
          x1="0"
          y1="200"
          x2="200"
          y2="0"
          stroke={refLine}
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        <path
          d="M 0,180 Q 50,160 80,120 T 140,50 T 200,20"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="square"
        />

        <circle cx="80" cy="120" r="4" fill={stroke} className="control-point" />
        <circle cx="140" cy="50" r="4" fill={stroke} className="control-point" />
      </svg>
    </Box>
  );
}
