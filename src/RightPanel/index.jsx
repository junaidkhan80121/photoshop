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
  applyToneCurve,
  CLIENT_FILTERS,
  exportImage,
  downloadDataUrl,
  getImageSize,
  resizeImage,
  DEFAULT_CURVE_POINTS,
} from '../utils/imageProcessing';
import './index.css';

function historyLabel(entry, index) {
  if (typeof entry === 'string') return `Step ${index + 1}`;
  return entry?.label || `Step ${index + 1}`;
}

function historyThumb(entry) {
  return typeof entry === 'string' ? entry : entry?.image;
}

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
  historyIndex = -1,
  onJumpHistory,
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
  fineRotate = 0,
  setFineRotate,
  onApplyFineRotate,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [localAdjustments, setLocalAdjustments] = useState(ZERO);
  const [isLive, setIsLive] = useState(false);
  const [curvePoints, setCurvePoints] = useState(DEFAULT_CURVE_POINTS.map((p) => ({ ...p })));
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [resizeW, setResizeW] = useState('');
  const [resizeH, setResizeH] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const aspectRef = useRef(1);
  const curveBaseRef = useRef(null);

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
  useEffect(() => {
    if (ownedUpdateRef.current) {
      ownedUpdateRef.current = false;
      return;
    }
    if (!image) {
      sessionBaseRef.current = null;
      curveBaseRef.current = null;
      setLocalAdjustments(ZERO);
      adjustmentsRef.current = ZERO;
      setIsLive(false);
      setImgSize({ width: 0, height: 0 });
      return;
    }
    sessionBaseRef.current = image;
    curveBaseRef.current = image;
    setLocalAdjustments(ZERO);
    adjustmentsRef.current = ZERO;
    Object.keys(ZERO).forEach((k) => setAdjustments(k, 0));
    setCurvePoints(DEFAULT_CURVE_POINTS.map((p) => ({ ...p })));
    setIsLive(false);
    getImageSize(image).then((size) => {
      setImgSize(size);
      setResizeW(String(size.width));
      setResizeH(String(size.height));
      aspectRef.current = size.width / Math.max(size.height, 1);
    }).catch(() => {});
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
      setActions(result, 'Adjust');
      curveBaseRef.current = result;
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
      setActions(result, filterName.replace(/_/g, ' '));
      curveBaseRef.current = result;
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
    setActions(source, 'Reset Adjust');
  };

  const curvePreviewRaf = useRef(null);
  const handleCurveChange = (pts) => {
    setCurvePoints(pts);
    const base = curveBaseRef.current || sessionBaseRef.current || image;
    if (!base) return;
    if (curvePreviewRaf.current) cancelAnimationFrame(curvePreviewRaf.current);
    curvePreviewRaf.current = requestAnimationFrame(async () => {
      try {
        const preview = await applyToneCurve(base, pts, { preview: true });
        setOwnedImage(preview);
        setIsLive(true);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleCurveCommit = async (pts) => {
    const base = curveBaseRef.current || sessionBaseRef.current || image;
    if (!base) return;
    try {
      setBackDrop(true);
      const result = await applyToneCurve(base, pts, { preview: false });
      setOwnedImage(result);
      setActions(result, 'Tone Curve');
      // Keep curveBase as pre-curve so further drags stay relative;
      // bake into session when user wants — for stacked edits, update base:
      curveBaseRef.current = result;
      sessionBaseRef.current = result;
      setCurvePoints(DEFAULT_CURVE_POINTS.map((p) => ({ ...p })));
      setIsLive(false);
      setBackDrop(false);
    } catch (e) {
      console.error(e);
      setBackDrop(false);
    }
  };

  const handleCurveReset = async (pts) => {
    setCurvePoints(pts);
    const base = curveBaseRef.current || sessionBaseRef.current;
    if (base) {
      setOwnedImage(base);
      setIsLive(false);
    }
  };

  const onResizeWidth = (val) => {
    setResizeW(val);
    if (lockAspect && val) {
      const w = parseInt(val, 10);
      if (!Number.isNaN(w)) {
        setResizeH(String(Math.max(1, Math.round(w / aspectRef.current))));
      }
    }
  };

  const onResizeHeight = (val) => {
    setResizeH(val);
    if (lockAspect && val) {
      const h = parseInt(val, 10);
      if (!Number.isNaN(h)) {
        setResizeW(String(Math.max(1, Math.round(h * aspectRef.current))));
      }
    }
  };

  const handleResize = async () => {
    if (!image) {
      showError('Please upload an image first');
      return;
    }
    const w = parseInt(resizeW, 10);
    const h = parseInt(resizeH, 10);
    if (!w || !h) {
      showError('Enter valid width and height');
      return;
    }
    try {
      setBackDrop(true);
      const result = await resizeImage(image, { width: w, height: h, lockAspect: false });
      setOwnedImage(result);
      setActions(result, `Resize ${w}×${h}`);
      sessionBaseRef.current = result;
      curveBaseRef.current = result;
      setImgSize({ width: w, height: h });
      aspectRef.current = w / h;
      setBackDrop(false);
    } catch (e) {
      console.error(e);
      showError('Resize failed');
      setBackDrop(false);
    }
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
        <Tab label="Transform" value="transform" className="panel-tab" />
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
          <Typography className="processing-hint">Drag points · applies on release</Typography>
          <ToneCurve
            darkMode={darkMode}
            points={curvePoints}
            onChange={handleCurveChange}
            onCommit={handleCurveCommit}
            onReset={handleCurveReset}
          />

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

      {activePanel === 'transform' && (
        <Box className="panel-content">
          <Typography className="section-title">IMAGE SIZE</Typography>
          <Typography className="processing-hint">
            {imgSize.width ? `${imgSize.width} × ${imgSize.height} px` : 'No image'}
          </Typography>

          <Box className="adjustment-row">
            <Typography className="adjustment-label">Width</Typography>
            <input
              className="resize-input"
              type="number"
              min="1"
              value={resizeW}
              onChange={(e) => onResizeWidth(e.target.value)}
            />
          </Box>
          <Box className="adjustment-row" style={{ marginTop: 8 }}>
            <Typography className="adjustment-label">Height</Typography>
            <input
              className="resize-input"
              type="number"
              min="1"
              value={resizeH}
              onChange={(e) => onResizeHeight(e.target.value)}
            />
          </Box>
          <Box className="adjustment-row" style={{ marginTop: 10 }}>
            <Typography className="adjustment-label">Lock aspect</Typography>
            <Button
              size="small"
              className={`preset-button ${lockAspect ? 'preset-active' : ''}`}
              onClick={() => setLockAspect((v) => !v)}
            >
              {lockAspect ? 'ON' : 'OFF'}
            </Button>
          </Box>
          <Button
            variant="contained"
            fullWidth
            className="export-panel-btn"
            onClick={handleResize}
            disabled={!image}
            sx={{ mt: 2, borderRadius: 0 }}
          >
            Apply Resize
          </Button>

          <Typography className="section-title">FINE ROTATE</Typography>
          <Typography className="processing-hint">1° steps · straighten horizons</Typography>
          <Box className="adjustment-row">
            <Typography className="adjustment-label">Angle</Typography>
            <Typography className="adjustment-value">
              {fineRotate > 0 ? `+${fineRotate}` : fineRotate}°
            </Typography>
          </Box>
          <Slider
            size="small"
            min={-45}
            max={45}
            step={1}
            value={fineRotate}
            onChange={(e, v) => setFineRotate?.(v)}
            className="adjustment-slider"
          />
          <Box className="history-controls">
            <Button
              className="history-button"
              size="small"
              onClick={() => setFineRotate?.((fineRotate || 0) - 1)}
            >
              −1°
            </Button>
            <Button
              className="history-button"
              size="small"
              onClick={() => setFineRotate?.((fineRotate || 0) + 1)}
            >
              +1°
            </Button>
            <Button
              className="reset-button"
              size="small"
              onClick={() => setFineRotate?.(0)}
            >
              0°
            </Button>
          </Box>
          <Button
            variant="contained"
            fullWidth
            className="export-panel-btn"
            disabled={!image || !fineRotate}
            onClick={() => onApplyFineRotate?.(fineRotate)}
            sx={{ mt: 1, borderRadius: 0 }}
          >
            Apply Rotate {fineRotate ? `${fineRotate > 0 ? '+' : ''}${fineRotate}°` : ''}
          </Button>
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
                  className={`history-item ${index === historyIndex ? 'active' : ''}`}
                  onClick={() => onJumpHistory?.(index)}
                >
                  <Box className="layer-thumbnail">
                    <img src={historyThumb(action)} alt="" />
                  </Box>
                  <Box>
                    <Typography className="history-step">{historyLabel(action, index)}</Typography>
                    <Typography className="processing-hint" style={{ margin: 0 }}>
                      #{index + 1}
                    </Typography>
                  </Box>
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
