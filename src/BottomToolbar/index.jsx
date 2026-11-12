import React from 'react';
import { Box, Typography, Slider, IconButton, Tooltip, TextField } from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Brush as BrushIcon,
  Opacity as OpacityIcon,
  Title as TextIcon,
  GridOn as GridOnIcon,
  GridOff as GridOffIcon,
} from '@mui/icons-material';
import './index.css';

const colors = [
  { id: 'white', color: '#ffffff' },
  { id: 'gray', color: '#737373' },
  { id: 'black', color: '#000000' },
  { id: 'red', color: '#ef4444' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'yellow', color: '#eab308' },
];

const TOOL_HINTS = {
  select: 'Select — ±1° / ±90° rotate · use Grid to align',
  crop: 'Crop — drag box, then Apply Crop',
  brush: 'Brush — paint, then Apply Brush',
  eraser: 'Eraser — erase, then Apply Erase',
  fill: 'Paint Bucket — click a region to fill, then Apply Fill',
  eyedropper: 'Eyedropper — click image to pick color',
  text: 'Text — set text below, click canvas to place, then Apply Text',
  rect: 'Rectangle — drag to draw, then Apply Shape',
  line: 'Line — drag to draw, then Apply Shape',
  circle: 'Ellipse — drag to draw, then Apply Shape',
  zoom: 'Zoom — click in, Shift+click out, or wheel',
  hand: 'Hand — drag to pan the image',
};

const COLOR_TOOLS = new Set(['brush', 'eraser', 'fill', 'text', 'rect', 'line', 'circle', 'eyedropper']);
const SIZE_TOOLS = new Set(['brush', 'eraser', 'rect', 'line', 'circle']);

export default function BottomToolbar({
  darkMode,
  activeTool,
  zoom,
  setZoom,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  textSize,
  setTextSize,
  textValue,
  setTextValue,
  showGrid = false,
  setShowGrid,
}) {
  const showColor = COLOR_TOOLS.has(activeTool);
  const showSize = SIZE_TOOLS.has(activeTool);
  const showText = activeTool === 'text';

  return (
    <Box className={`bottom-toolbar ${darkMode ? 'dark' : 'light'}`}>
      {showColor || showSize || showText ? (
        <>
          {showSize && (
            <>
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
            </>
          )}

          {showText && (
            <>
              <Box className="toolbar-section">
                <Box className="section-header">
                  <TextIcon className="section-icon" />
                  <Typography className="section-label">TEXT</Typography>
                </Box>
              </Box>
              <TextField
                size="small"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Type text…"
                className="text-tool-input"
                sx={{
                  minWidth: 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    color: darkMode ? '#fff' : '#000',
                    fontSize: 12,
                    height: 32,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  },
                }}
              />
              <Box className="toolbar-section">
                <Typography className="section-label">SIZE</Typography>
                <Typography className="section-value">{textSize}</Typography>
              </Box>
              <Box className="slider-container small">
                <Slider
                  size="small"
                  min={12}
                  max={200}
                  value={textSize}
                  onChange={(e, v) => setTextSize(v)}
                  className="toolbar-slider"
                />
              </Box>
              <Box className="toolbar-divider" />
            </>
          )}

          {showColor && (
            <>
              <Box className="toolbar-section">
                <Box className="section-header">
                  <OpacityIcon className="section-icon" />
                  <Typography className="section-label">COLOR</Typography>
                </Box>
              </Box>

              <Box
                className="color-swatch active"
                style={{ backgroundColor: brushColor, width: 22, height: 22 }}
                title={brushColor}
              />

              <Box className="color-picker">
                {colors.map((c) => (
                  <Tooltip key={c.id} title={c.id.charAt(0).toUpperCase() + c.id.slice(1)}>
                    <Box
                      className={`color-swatch ${brushColor === c.color ? 'active' : ''}`}
                      style={{ backgroundColor: c.color }}
                      onClick={() => setBrushColor(c.color)}
                    />
                  </Tooltip>
                ))}
              </Box>
            </>
          )}
        </>
      ) : (
        <Box className="toolbar-placeholder">
          <Typography className="placeholder-text">
            {TOOL_HINTS[activeTool] || 'Select a tool from the left bar'}
          </Typography>
        </Box>
      )}

      {(showColor || showSize || showText) && (
        <Box className="toolbar-placeholder" style={{ flex: '0 1 auto', minWidth: 0, marginLeft: 8 }}>
          <Typography className="placeholder-text" style={{ fontSize: 11 }}>
            {TOOL_HINTS[activeTool]}
          </Typography>
        </Box>
      )}

      <Tooltip title={showGrid ? 'Hide alignment grid (Alt+G)' : 'Show alignment grid (Alt+G)'}>
        <IconButton
          className={`zoom-button ${showGrid ? 'grid-active' : ''}`}
          size="small"
          onClick={() => setShowGrid?.(!showGrid)}
        >
          {showGrid ? <GridOnIcon fontSize="small" /> : <GridOffIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

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
          onClick={() => setZoom(Math.min(400, zoom + 10))}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
