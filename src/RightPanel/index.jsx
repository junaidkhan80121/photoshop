import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import Histogram from './Histogram';
import ToneCurve from './ToneCurve';
import {
  applyAdjustments,
  applyFilter,
  CLIENT_FILTERS,
  exportImage,
  downloadDataUrl,
} from '../utils/imageProcessing';
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

const ZERO = { exposure: 0, contrast: 0, highlights: 0, shadows: 0 };

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
  exportFormat = 'jpeg',
  setExportFormat,
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
  const [localAdjustments, setLocalAdjustments] = useState(ZERO);
  const [isLive, setIsLive] = useState(false);

  // Unadjusted source for the current slider session — never overwritten by commits
  const sessionBaseRef = useRef(null);
  const ownedUpdateRef = useRef(false);
  const previewRaf = useRef(null);
  const previewToken = useRef(0);
  const adjustmentsRef = useRef(ZERO);

  const setOwnedImage = useCallback((nextImage) => {
    ownedUpdateRef.current = true;
    setImage(nextImage);
  }, [setImage]);

  const clearSliderValues = useCallback(() => {
    setLocalAdjustments(ZERO);
    adjustmentsRef.current = ZERO;
    Object.keys(ZERO).forEach((k) => setAdjustments(k, 0));
  }, [setAdjustments]);

  // Adopt external image changes (upload / undo / redo / crop) as a new session base.
  // Only react to `image` — owned panel updates keep the same session base + slider values.
  useEffect(() => {
    if (ownedUpdateRef.current) {
      ownedUpdateRef.current = false;
      return;
    }
    if (!image) {
      sessionBaseRef.current = null;
      setLocalAdjustments(ZERO);
      adjustmentsRef.current = ZERO;
      setIsLive(false);
      return;
    }
    sessionBaseRef.current = image;
    setLocalAdjustments(ZERO);
    adjustmentsRef.current = ZERO;
    Object.keys(ZERO).forEach((k) => setAdjustments(k, 0));
    setIsLive(false);
    // Intentionally only [image]: setAdjustments identity must not reset the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const showError = (message) => {
    setSnackBarMessage(message);
    setSnackBar(true);
  };

  const handleTabChange = (event, newValue) => {
    setActivePanel(newValue);
  };

  const ensureSessionBase = () => {
    if (!sessionBaseRef.current && image) {
      sessionBaseRef.current = image;
    }
    return sessionBaseRef.current;
  };

  const runLivePreview = useCallback(async (next) => {
    const source = sessionBaseRef.current;
    if (!source) return;

    const token = ++previewToken.current;
    try {
      const isZero = Object.values(next).every((v) => v === 0);
      const preview = isZero
        ? source
        : await applyAdjustments(source, next, { preview: true, maxSide: 960 });
      if (token !== previewToken.current) return;
      setOwnedImage(preview);
      setIsLive(!isZero);
    } catch (e) {
      console.error('Live preview failed:', e);
    }
  }, [setOwnedImage]);

  const schedulePreview = useCallback((next) => {
    if (previewRaf.current) cancelAnimationFrame(previewRaf.current);
    previewRaf.current = requestAnimationFrame(() => {
      runLivePreview(next);
    });
  }, [runLivePreview]);

  const commitAdjustments = useCallback(async (next) => {
    const source = sessionBaseRef.current;
    if (!source) return;

    const isZero = Object.values(next).every((v) => v === 0);
    if (isZero) {
      setOwnedImage(source);
      setIsLive(false);
      return;
    }

    try {
      setBackDrop(true);
      // Keep session base + slider values; only refresh the displayed/history image
      const result = await applyAdjustments(source, next, { preview: false });
      setOwnedImage(result);
      setActions(result);
      setIsLive(false);
      setBackDrop(false);
    } catch (e) {
      console.error('Commit adjustments failed:', e);
      showError('Error applying adjustments');
      setBackDrop(false);
    }
  }, [setOwnedImage, setActions, setBackDrop]);

  const handleAdjustmentChange = (key, value) => {
    if (!image && !sessionBaseRef.current) {
      showError('Please upload an image first');
      return;
    }
    ensureSessionBase();

    const next = { ...adjustmentsRef.current, [key]: value };
    adjustmentsRef.current = next;
    setLocalAdjustments(next);
    setAdjustments(key, value);
    schedulePreview(next);
  };

  const handleAdjustmentCommit = () => {
    commitAdjustments(adjustmentsRef.current);
  };

  const getFilter = async (filterName) => {
    const base = ensureSessionBase() || image;
    if (!base) {
      showError('Please upload an image first');
      return;
    }
    if (!CLIENT_FILTERS.has(filterName)) {
      showError('Filter not available offline');
      return;
    }

    try {
      setBackDrop(true);
      let source = base;
      const hasAdj = Object.values(adjustmentsRef.current).some((v) => v !== 0);
      if (hasAdj) {
        source = await applyAdjustments(base, adjustmentsRef.current, { preview: false });
      }
      const result = await applyFilter(source, filterName);
      // Filters bake into a new session base; sliders reset
      sessionBaseRef.current = result;
      clearSliderValues();
      setOwnedImage(result);
      setActions(result);
      setIsLive(false);
      setBackDrop(false);
    } catch (e) {
      console.error('Error applying filter:', e);
      showError('Error processing image');
      setBackDrop(false);
    }
  };

  const applyPreset = async (preset) => {
    if (!image && !sessionBaseRef.current) {
      showError('Please upload an image first');
      return;
    }
    ensureSessionBase();

    const next = { ...ZERO, ...preset.filters };
    adjustmentsRef.current = next;
    setLocalAdjustments(next);
    Object.entries(next).forEach(([k, v]) => setAdjustments(k, v));
    await commitAdjustments(next);
  };

  const formatValue = (value) => {
    if (value > 0) return `+${value}`;
    return value;
  };

  const resetAdjustments = () => {
    const source = sessionBaseRef.current;
    clearSliderValues();
    setIsLive(false);
    if (!source) return;
    setOwnedImage(source);
    setActions(source);
  };

  const handleUndoClick = () => {
    onUndo?.();
  };

  const handleRedoClick = () => {
    onRedo?.();
  };

  const handleDownload = async () => {
    if (!image) {
      showError('Please upload an image first');
      return;
    }
    try {
      setBackDrop(true);
      const { dataUrl, extension } = await exportImage(image, {
        format: exportFormat,
        quality: compressionFactor,
      });
      downloadDataUrl(dataUrl, `edited-image.${extension}`);
      setBackDrop(false);
    } catch (e) {
      console.error('Export failed:', e);
      showError('Export failed');
      setBackDrop(false);
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

      <Tabs
        value={activePanel}
        onChange={handleTabChange}
        className="panel-tabs"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{ className: 'tab-indicator' }}
      >
        <Tab label="Adjust" value="adjust" className="panel-tab" />
        <Tab label="Filters" value="filters" className="panel-tab" />
        <Tab label="Export" value="export" className="panel-tab" />
        <Tab label="History" value="history" className="panel-tab" />
      </Tabs>

      {activePanel === 'adjust' && (
        <Box className="panel-content">
          <Box className="histogram-section">
            <Histogram darkMode={darkMode} />
          </Box>

          <Box className="image-info">
            <Box className="info-item">
              <Box className="info-dot green" />
              <Typography className="info-text">Realtime FE</Typography>
            </Box>
            <Box className="info-divider" />
            <Typography className="info-text">
              {isLive ? 'Preview' : 'Committed'}
            </Typography>
          </Box>

          <Box className="history-controls">
            <Button
              className="history-button"
              startIcon={<UndoIcon />}
              onClick={handleUndoClick}
              disabled={!canUndo}
              size="small"
            >
              Undo
            </Button>
            <Button
              className="history-button"
              startIcon={<RedoIcon />}
              onClick={handleRedoClick}
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

          <Typography className="section-title">EXPOSURE & COLOR</Typography>
          <Typography className="processing-hint">Live preview · Reset restores original</Typography>

          {['exposure', 'contrast', 'highlights', 'shadows'].map((key) => (
            <React.Fragment key={key}>
              <Box className="adjustment-row">
                <Typography className="adjustment-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
                <Typography className="adjustment-value">
                  {formatValue(localAdjustments[key])}
                </Typography>
              </Box>
              <Slider
                size="small"
                min={-100}
                max={100}
                step={1}
                value={localAdjustments[key]}
                onChange={(e, v) => handleAdjustmentChange(key, v)}
                onChangeCommitted={handleAdjustmentCommit}
                className="adjustment-slider"
              />
            </React.Fragment>
          ))}

          <Typography className="section-title">TONE CURVE</Typography>
          <ToneCurve darkMode={darkMode} />

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
        </Box>
      )}

      {activePanel === 'filters' && (
        <Box className="panel-content">
          <Typography className="section-title">CLICK A FILTER TO APPLY</Typography>
          <Typography className="processing-hint">Runs instantly on device</Typography>
          <Box className="filters-list">
            {filters.map((filter, index) => (
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
        </Box>
      )}

      {activePanel === 'export' && (
        <Box className="panel-content">
          <Typography className="section-title">FORMAT</Typography>
          <Typography className="processing-hint">Convert before download</Typography>
          <Box className="presets-grid">
            {['jpeg', 'png', 'webp'].map((fmt) => (
              <Button
                key={fmt}
                className={`preset-button ${exportFormat === fmt ? 'preset-active' : ''}`}
                variant="outlined"
                onClick={() => setExportFormat?.(fmt)}
              >
                {fmt.toUpperCase()}
              </Button>
            ))}
          </Box>

          <Typography className="section-title">COMPRESSION / QUALITY</Typography>
          <Box className="compression-section">
            <Box className="adjustment-row">
              <Typography className="adjustment-label">
                Quality
              </Typography>
              <Typography className="adjustment-value">
                {Math.round(compressionFactor * 100)}%
              </Typography>
            </Box>
            <Slider
              value={compressionFactor}
              min={0.1}
              max={1}
              step={0.05}
              size="small"
              disabled={exportFormat === 'png'}
              onChange={(e, newValue) => setCompressionFactor(newValue)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
            <Typography className="processing-hint">
              {exportFormat === 'png'
                ? 'PNG is lossless — quality slider disabled'
                : 'Lower quality = smaller JPEG/WebP file'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            className="export-panel-btn"
            onClick={handleDownload}
            disabled={!image}
            sx={{ mt: 2, borderRadius: 0 }}
          >
            Download {exportFormat.toUpperCase()}
          </Button>
        </Box>
      )}

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

  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        className="right-panel-drawer"
        PaperProps={{
          className: `right-panel mobile ${darkMode ? 'dark' : 'light'}`,
        }}
      >
        {panelContent}
      </Drawer>
    );
  }

  return (
    <Box className={`right-panel ${darkMode ? 'dark' : 'light'}`}>
      {panelContent}
    </Box>
  );
}
