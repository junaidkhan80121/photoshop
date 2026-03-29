import React from 'react';
import { Box } from '@mui/material';
import './Histogram.css';

export default function Histogram({ darkMode }) {
  // Generate histogram bars with varying heights to simulate a real histogram
  const generateBars = () => {
    const bars = [];
    const heights = [
      15, 22, 28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 82, 78, 85, 92,
      88, 95, 85, 78, 82, 75, 68, 72, 65, 58, 62, 55, 48, 52, 45, 38, 42, 35, 28, 32
    ];
    
    for (let i = 0; i < 40; i++) {
      const height = heights[i] || Math.random() * 60 + 20;
      bars.push(
        <Box
          key={i}
          className="histogram-bar"
          style={{
            height: `${height}%`,
            background: `linear-gradient(180deg, 
              ${i < 13 ? '#60a5fa' : i < 26 ? '#a78bfa' : '#f472b6'}, 
              ${i < 13 ? '#3b82f6' : i < 26 ? '#8b5cf6' : '#ec4899'})`
          }}
        />
      );
    }
    return bars;
  };

  return (
    <Box className={`histogram ${darkMode ? 'dark' : 'light'}`}>
      <Box className="histogram-bars">
        {generateBars()}
      </Box>
      <Box className="histogram-overlay" />
    </Box>
  );
}
