import React from 'react';
import { Box } from '@mui/material';
import './Histogram.css';

export default function Histogram({ darkMode }) {
  const generateBars = () => {
    const bars = [];
    const heights = [
      15, 22, 28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 82, 78, 85, 92,
      88, 95, 85, 78, 82, 75, 68, 72, 65, 58, 62, 55, 48, 52, 45, 38, 42, 35, 28, 32,
    ];

    for (let i = 0; i < 40; i++) {
      const height = heights[i] || 40;
      const shade = darkMode
        ? 180 + Math.floor((i / 40) * 75)
        : 40 + Math.floor((i / 40) * 80);
      bars.push(
        <Box
          key={i}
          className="histogram-bar"
          style={{
            height: `${height}%`,
            background: `rgb(${shade}, ${shade}, ${shade})`,
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
