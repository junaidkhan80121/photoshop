import React, { useState, useCallback, useRef } from 'react';
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
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ChevronRight as ClosePanelIcon,
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
  { title: 'Oil Painting', filter: 'oil_painting', image: './filter_preview/oil_painting.png' },
  { title: 'Solarize', filter: 'solarize', image: './filter_preview/solarize.png' },
  { title: 'Pixelate', filter: 'pixelate', image: './filter_preview/pixelate.png' },
  { title: 'Canny', filter: 'canny', image: './filter_preview/canny.png' },
  { title: 'Heatmap', filter: 'heatmap', image: './filter_preview/heatmap.png' },
  { title: 'HSV', filter: 'hsv', image: './filter_preview/hsv.png' },
  { title: 'Posterize', filter: 'posterize', image: './filter_preview/posterize.png' },
];

const presets = [
  { id: 'cine_dark', name: 'CINE_DARK', filters: { contrast: 20, shadows: 30 } },
  { id: 'vibe_800', name: 'VIBE_800', filters: { exposure: 10, highlights: -20, shadows: 20 } },
  { id: 'matte_wb', name: 'MATTE_W_B', filters: { contrast: -15, highlights: -10 } },
  { id: 'pro_mist', name: 'PRO_MIST', filters: { exposure: 15, highlights: -30 } },
];

// API base URL - update this to your backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isOpen,
  onClose,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [localAdjustments, setLocalAdjustments] = useState({
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
  });
  const debounceTimer = useRef(null);

  const handleTabChange = (event, newValue) => {
    setActivePanel(newValue);
  };

  const showError = (message) => {
    setSnackBarMessage(message);
    setSnackBar(true);
  };

  const applyAdjustments = useCallback(async (adjustments) => {
    if (!image) {
      showError('Please upload an image first');
      return;
    }

    try {
      setBackDrop(true);
      const response = await axios.post(`${API_URL}/adjust`, {
        image: image,
        ...adjustments
      });
      
      if (response.data && response.data.image) {
        setImage(response.data.image);
        setActions(prev => [...prev, response.data.image]);
      }
      setBackDrop(false);
    } catch (e) {
      console.error('Error applying adjustments:', e);
      showError('Error applying adjustments');
      setBackDrop(false);
    }
  }, [image, setImage, setActions, setBackDrop]);

  const handleAdjustmentChange = (key, value) => {
    setLocalAdjustments(prev => ({ ...prev, [key]: value }));
    setAdjustments(key, value);
    
    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      const newAdjustments = { ...localAdjustments, [key]: value };
      applyAdjustments(newAdjustments);
    }, 300);
  };

  const getFilter = async (filter) => {
    if (!image) {
      showError('Please upload an image first');
      return;
    }
    try {
      setBackDrop(true);
      const response = await axios.post(`${API_URL}/filter`, {
        filter: filter,
        image: image,
      });
      
      if (response.data && response.data.image) {
        setImage(response.data.image);
        setActions(prev => [...prev, response.data.image]);
      }
      setBackDrop(false);
    } catch (e) {
      console.error('Error applying filter:', e);
      showError('Error processing image');
      setBackDrop(false);
    }
  };

  const applyPreset = async (preset) => {
    if (!image) {
      showError('Please upload an image first');
      return;
    }
    
    const newAdjustments = { ...localAdjustments, ...preset.filters };
    setLocalAdjustments(newAdjustments);
    await applyAdjustments(newAdjustments);
  };

  const formatValue = (value) => {
    if (value > 0) return `+${value}`;
    return value;
  };

  const resetAdjustments = () => {
    setLocalAdjustments({
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
    });
    if (image) {
      applyAdjustments({
        exposure: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
      });
    }
  };

  const panelContent = (
    <>
      {isMobile && (
        <Box className="mobile-panel-header">
          <Typography className="mobile-panel-title">Adjustments</Typography>
          <IconButton onClick={onClose} size="small" className="mobile-close-btn">
            <ClosePanelIcon />
          </IconButton>
        </Box>
      )}
      
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        open={snackBar}
        onClose={() => setSnackBar(false)}
        style={{ top: isMobile ? 60 : 0 }}
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
          {snackBarMessage}
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

          {/* Undo/Redo Buttons */}
          <Box className="history-controls">
            <Button
              className="history-button"
              startIcon={<UndoIcon />}
              onClick={onUndo}
              disabled={!canUndo}
              size="small"
            >
              Undo
            </Button>
            <Button
              className="history-button"
              startIcon={<RedoIcon />}
              onClick={onRedo}
              disabled={!canRedo}
              size="small"
            >
              Redo
            </Button>
            <Button
              className="reset-button"
              onClick={resetAdjustments}
              size="small"
            >
              Reset
            </Button>
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
                onClick={() => applyPreset(preset)}
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

          {/* All Filters */}
          <Typography className="section-title">ALL FILTERS</Typography>
          <Box className="filters-grid">
            {filters.map((filter, index) => (
              <Box
                key={index}
                className="filter-grid-item"
                onClick={() => getFilter(filter.filter)}
              >
                <img src={filter.image} alt={filter.title} className="filter-grid-thumb" />
                <Typography className="filter-grid-name">{filter.title}</Typography>
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
          {image ? (
            <Box className="layers-list">
              <Box className="layer-item active">
                <Box className="layer-thumbnail">
                  <img src={image} alt="Base" />
                </Box>
                <Typography className="layer-name">Background</Typography>
              </Box>
            </Box>
          ) : (
            <Typography className="empty-state">No image loaded</Typography>
          )}
        </Box>
      )}

      {/* History Panel */}
      {activePanel === 'history' && (
        <Box className="panel-content">
          {Actions.length > 0 ? (
            <Box className="history-list">
              {Actions.map((action, index) => (
                <Box 
                  key={index} 
                  className={`history-item ${index === Actions.length - 1 ? 'active' : ''}`}
                >
                  <Typography className="history-step">Step {index + 1}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography className="empty-state">History is empty</Typography>
          )}
        </Box>
      )}
    </>
  );
  
  // Mobile drawer version
  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        className="right-panel-drawer"
        PaperProps={{
          className: `right-panel mobile ${darkMode ? 'dark' : 'light'}`
        }}
      >
        {panelContent}
      </Drawer>
    );
  }
  
  // Desktop version
  return (
    <Box className={`right-panel ${darkMode ? 'dark' : 'light'}`}>
      {panelContent}
    </Box>
  );
}
