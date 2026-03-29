import React, { useState } from 'react';
import { Box, Typography, Slider, IconButton, Tooltip } from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Brush as BrushIcon,
  Opacity as OpacityIcon,
} from '@mui/icons-material';
import './index.css';

const colors = [
  { id: 'blue', color: '#60a5fa' },
  { id: 'pink', color: '#f472b6' },
  { id: 'white', color: '#f8fafc' },
];

export default function BottomToolbar({ darkMode, activeTool }) {
  const [brushSize, setBrushSize] = useState(45);
  const [hardness, setHardness] = useState(85);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [zoom, setZoom] = useState(82);

  const showBrushSettings = ['brush', 'eraser'].includes(activeTool);

  return (
    <Box className={`bottom-toolbar ${darkMode ? 'dark' : 'light'}`}>
      {showBrushSettings ? (
        <>
          {/* Brush Size */}
          <Box className="toolbar-section">
            <Box className="section-header">
              <BrushIcon className="section-icon" />
              <Typography className="section-label">SIZE</Typography>
            </Box>
            <Typography className="section-value">{brushSize}px</Typography>
          </Box>

          <Box className="slider-container small">
            <Slider
              size="small"
              min={1}
              max={200}
              value={brushSize}
              onChange={(e, v) => setBrushSize(v)}
              className="toolbar-slider"
            />
          </Box>

          <Box className="toolbar-divider" />

          {/* Hardness */}
          <Box className="toolbar-section">
            <Box className="section-header">
              <OpacityIcon className="section-icon" />
              <Typography className="section-label">HARDNESS</Typography>
            </Box>
            <Typography className="section-value">{hardness}%</Typography>
          </Box>

          <Box className="slider-container small">
            <Slider
              size="small"
              min={0}
              max={100}
              value={hardness}
              onChange={(e, v) => setHardness(v)}
              className="toolbar-slider"
            />
          </Box>

          <Box className="toolbar-divider" />

          {/* Colors */}
          <Box className="color-picker">
            {colors.map((c) => (
              <Tooltip key={c.id} title={c.id.charAt(0).toUpperCase() + c.id.slice(1)}>
                <Box
                  className={`color-swatch ${selectedColor === c.id ? 'active' : ''}`}
                  style={{ backgroundColor: c.color }}
                  onClick={() => setSelectedColor(c.id)}
                />
              </Tooltip>
            ))}
          </Box>
        </>
      ) : (
        <Box className="toolbar-placeholder">
          <Typography className="placeholder-text">
            {activeTool === 'select' && 'Select Tool Active'}
            {activeTool === 'crop' && 'Crop Tool Active'}
            {activeTool === 'text' && 'Text Tool Active'}
            {activeTool === 'grad' && 'Gradient Tool Active'}
            {activeTool === 'zoom' && 'Zoom Tool Active'}
            {activeTool === 'hand' && 'Hand Tool Active'}
          </Typography>
        </Box>
      )}

      {/* Zoom Controls - Always visible */}
      <Box className="zoom-controls">
        <IconButton 
          className="zoom-button"
          size="small"
          onClick={() => setZoom(Math.max(10, zoom - 10))}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography className="zoom-value">{zoom}%</Typography>
        <IconButton 
          className="zoom-button"
          size="small"
          onClick={() => setZoom(Math.min(200, zoom + 10))}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
