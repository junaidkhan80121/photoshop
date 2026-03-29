import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Slider,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Histogram from './Histogram';
import ToneCurve from './ToneCurve';
import './index.css';

const filters = [
  { title: 'GrayScale', filter: 'grayscale', image: './filter_preview/grayscale.png' },
  { title: 'Emboss', filter: 'emboss', image: './filter_preview/emboss.png' },
  { title: 'Vignette', filter: 'vignette', image: './filter_preview/vignette.png' },
  { title: 'Negative', filter: 'negative', image: './filter_preview/negative.png' },
  { title: 'Cartoon', filter: 'cartoon', image: './filter_preview/cartoon.png' },
  { title: 'Sepia', filter: 'sepia', image: './filter_preview/sepia.png' },
  { title: 'Glow', filter: 'glow', image: './filter_preview/glow.png' },
  { title: 'Pencil Sketch', filter: 'pencil_sketch', image: './filter_preview/pencil_sketch.png' },
  { title: 'Oil Painting', filter: 'oil_paintintg', image: './filter_preview/oil_painting.png' },
  { title: 'Solarize', filter: 'solarize', image: './filter_preview/solarize.png' },
  { title: 'Pixelate', filter: 'pixelate', image: './filter_preview/pixelate.png' },
  { title: 'Canny', filter: 'canny', image: './filter_preview/canny.png' },
  { title: 'Heatmap', filter: 'heatmap', image: './filter_preview/heatmap.png' },
  { title: 'HSV', filter: 'hsv', image: './filter_preview/hsv.png' },
  { title: 'Posterize', filter: 'posterize', image: './filter_preview/posterize.png' },
];

const presets = [
  { id: 'cine_dark', name: 'CINE_DARK' },
  { id: 'vibe_800', name: 'VIBE_800' },
  { id: 'matte_wb', name: 'MATTE_W_B' },
  { id: 'pro_mist', name: 'PRO_MIST' },
];

export default function RightPanel({
  darkMode,
  activePanel,
  setActivePanel,
  setAdjustments,
  image,
  setImage,
  setActions,
  Actions,
  setBackDrop,
  compressionFactor,
  setCompressionFactor,
}) {
  const [snackBar, setSnackBar] = useState(false);
  const [localAdjustments, setLocalAdjustments] = useState({
    exposure: 0.45,
    contrast: -12,
    highlights: 0,
    shadows: 24,
  });

  const handleTabChange = (event, newValue) => {
    setActivePanel(newValue);
  };

  const handleAdjustmentChange = (key, value) => {
    setLocalAdjustments(prev => ({ ...prev, [key]: value }));
    setAdjustments(key, value);
  };

  const getFilter = async (filter) => {
    if (!image) {
      setSnackBar(true);
      return;
    }
    try {
      setBackDrop(true);
      const response = await axios.post('https://photoshop-sz.onrender.com/filter', {
        filter: filter,
        image: image,
      });
      setImage(response.data['image']);
      setActions([...Actions, response.data['image']]);
      setBackDrop(false);
    } catch (e) {
      setSnackBar(true);
      setBackDrop(false);
    }
  };

  const formatValue = (value) => {
    if (value > 0) return `+${value}`;
    return value;
  };

  return (
    <Box className={`right-panel ${darkMode ? 'dark' : 'light'}`}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        open={snackBar}
        onClose={() => setSnackBar(false)}
      >
        <Alert
          severity="error"
          variant="filled"
          action={
            <IconButton size="small" onClick={() => setSnackBar(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          Error processing image
        </Alert>
      </Snackbar>

      {/* Tabs */}
      <Tabs
        value={activePanel}
        onChange={handleTabChange}
        className="panel-tabs"
        TabIndicatorProps={{ className: 'tab-indicator' }}
      >
        <Tab label="Adjust" value="adjust" className="panel-tab" />
        <Tab label="Layers" value="layers" className="panel-tab" />
        <Tab label="History" value="history" className="panel-tab" />
      </Tabs>

      {/* Adjust Panel */}
      {activePanel === 'adjust' && (
        <Box className="panel-content">
          {/* Histogram */}
          <Box className="histogram-section">
            <Histogram darkMode={darkMode} />
          </Box>

          {/* Image Info */}
          <Box className="image-info">
            <Box className="info-item">
              <Box className="info-dot green" />
              <Typography className="info-text">4000 x 6000 px</Typography>
            </Box>
            <Box className="info-divider" />
            <Typography className="info-text">72 DPI</Typography>
            <Box className="info-divider" />
            <Typography className="info-text">16-BIT PRO-PHOTO RGB</Typography>
          </Box>

          {/* Exposure & Color Section */}
          <Typography className="section-title">EXPOSURE & COLOR</Typography>

          <Box className="adjustment-row">
            <Typography className="adjustment-label">Exposure</Typography>
            <Typography className="adjustment-value">{formatValue(localAdjustments.exposure)}</Typography>
          </Box>
          <Slider
            size="small"
            min={-100}
            max={100}
            step={1}
            value={localAdjustments.exposure}
            onChange={(e, v) => handleAdjustmentChange('exposure', v)}
            className="adjustment-slider"
          />

          <Box className="adjustment-row">
            <Typography className="adjustment-label">Contrast</Typography>
            <Typography className="adjustment-value">{formatValue(localAdjustments.contrast)}</Typography>
          </Box>
          <Slider
            size="small"
            min={-100}
            max={100}
            step={1}
            value={localAdjustments.contrast}
            onChange={(e, v) => handleAdjustmentChange('contrast', v)}
            className="adjustment-slider"
          />

          <Box className="adjustment-row">
            <Typography className="adjustment-label">Highlights</Typography>
            <Typography className="adjustment-value">{formatValue(localAdjustments.highlights)}</Typography>
          </Box>
          <Slider
            size="small"
            min={-100}
            max={100}
            step={1}
            value={localAdjustments.highlights}
            onChange={(e, v) => handleAdjustmentChange('highlights', v)}
            className="adjustment-slider"
          />

          <Box className="adjustment-row">
            <Typography className="adjustment-label">Shadows</Typography>
            <Typography className="adjustment-value">{formatValue(localAdjustments.shadows)}</Typography>
          </Box>
          <Slider
            size="small"
            min={-100}
            max={100}
            step={1}
            value={localAdjustments.shadows}
            onChange={(e, v) => handleAdjustmentChange('shadows', v)}
            className="adjustment-slider"
          />

          {/* Tone Curve */}
          <Typography className="section-title">TONE CURVE</Typography>
          <ToneCurve darkMode={darkMode} />

          {/* Presets */}
          <Typography className="section-title">PRESETS</Typography>
          <Box className="presets-grid">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                className="preset-button"
                variant="outlined"
              >
                {preset.name}
              </Button>
            ))}
          </Box>

          {/* Filters Section */}
          <Typography className="section-title">QUICK FILTERS</Typography>
          <Box className="filters-list">
            {filters.slice(0, 6).map((filter, index) => (
              <Box
                key={index}
                className="filter-item"
                onClick={() => getFilter(filter.filter)}
              >
                <img src={filter.image} alt={filter.title} className="filter-thumb" />
                <Typography className="filter-name">{filter.title}</Typography>
              </Box>
            ))}
          </Box>

          {/* Compression */}
          <Typography className="section-title">COMPRESSION</Typography>
          <Box className="compression-section">
            <Typography className="adjustment-label">
              Quality: {Math.round(compressionFactor * 100)}%
            </Typography>
            <Slider
              value={compressionFactor}
              min={0.1}
              max={1}
              step={0.1}
              size="small"
              onChange={(e, newValue) => setCompressionFactor(newValue)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
          </Box>
        </Box>
      )}

      {/* Layers Panel */}
      {activePanel === 'layers' && (
        <Box className="panel-content">
          <Typography className="empty-state">No layers yet</Typography>
        </Box>
      )}

      {/* History Panel */}
      {activePanel === 'history' && (
        <Box className="panel-content">
          <Typography className="empty-state">History is empty</Typography>
        </Box>
      )}
    </Box>
  );
}
