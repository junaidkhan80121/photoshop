import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Box, Typography, Fade, Backdrop, CircularProgress, Button } from '@mui/material';
import { CloudUpload as UploadIcon, CropFree as CropIcon } from '@mui/icons-material';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { cropImage, rotateImage } from '../utils/imageProcessing';
import './index.css';

const DRAW_TOOLS = new Set(['brush', 'eraser', 'text', 'rect', 'line', 'circle', 'fill', 'eyedropper']);

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Simple flood fill with color tolerance */
function floodFill(ctx, x, y, fillHex, tolerance = 28) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const sx = Math.floor(x);
  const sy = Math.floor(y);
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return;

  const start = (sy * width + sx) * 4;
  const tr = data[start];
  const tg = data[start + 1];
  const tb = data[start + 2];
  const fill = hexToRgb(fillHex);

  if (Math.abs(tr - fill.r) + Math.abs(tg - fill.g) + Math.abs(tb - fill.b) < 8) return;

  const match = (i) =>
    Math.abs(data[i] - tr) <= tolerance &&
    Math.abs(data[i + 1] - tg) <= tolerance &&
    Math.abs(data[i + 2] - tb) <= tolerance;

  const stack = [[sx, sy]];
  const seen = new Uint8Array(width * height);

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const idx = cy * width + cx;
    if (cx < 0 || cy < 0 || cx >= width || cy >= height || seen[idx]) continue;
    const i = idx * 4;
    if (!match(i)) continue;
    seen[idx] = 1;
    data[i] = fill.r;
    data[i + 1] = fill.g;
    data[i + 2] = fill.b;
    data[i + 3] = 255;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

export default function ImageCanvas({
  image,
  setImage,
  setActions,
  setBackDrop,
  backDrop,
  activeTool,
  darkMode,
  zoom = 100,
  brushSize = 24,
  brushColor = '#ffffff',
  setBrushColor,
  textSize = 48,
  textValue = 'Text',
}) {
  const [dragActive, setDragActive] = useState(false);
  const cropperRef = useRef(null);
  const paintRef = useRef(null);
  const painting = useRef(false);
  const lastPoint = useRef(null);
  const shapeStart = useRef(null);
  const snapshot = useRef(null);
  const zoomRatio = zoom / 100;

  const isDrawTool = DRAW_TOOLS.has(activeTool);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [setImage]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !image || isDrawTool) return;

    try {
      if (activeTool === 'crop') {
        cropper.setDragMode('crop');
        cropper.crop();
      } else if (activeTool === 'hand') {
        cropper.clear();
        cropper.setDragMode('move');
      } else if (activeTool === 'zoom') {
        cropper.clear();
        cropper.setDragMode('none');
      } else {
        cropper.clear();
        cropper.setDragMode('none');
      }
    } catch (e) {
      // Cropper may not be ready yet
    }
  }, [activeTool, image, isDrawTool]);

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !image || isDrawTool) return;
    try {
      cropper.zoomTo(zoomRatio);
    } catch (e) {
      // ignore until ready
    }
  }, [zoomRatio, image, isDrawTool]);

  useEffect(() => {
    if (!isDrawTool || !image || !paintRef.current) return;
    const canvas = paintRef.current;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
    };
    img.src = image;
  }, [isDrawTool, image, activeTool]);

  const getPaintPos = (e) => {
    const canvas = paintRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const lineWidth = () => {
    const canvas = paintRef.current;
    if (!canvas) return brushSize;
    return brushSize * (canvas.width / Math.max(canvas.getBoundingClientRect().width, 1));
  };

  const stroke = (from, to) => {
    const canvas = paintRef.current;
    if (!canvas || !from || !to) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth();

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const restoreSnapshot = () => {
    const canvas = paintRef.current;
    if (!canvas || !snapshot.current) return;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(snapshot.current, 0, 0);
  };

  const drawShapePreview = (end) => {
    const canvas = paintRef.current;
    const start = shapeStart.current;
    if (!canvas || !start || !end) return;
    restoreSnapshot();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor;
    ctx.lineWidth = lineWidth();
    ctx.lineCap = 'round';

    if (activeTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (activeTool === 'rect') {
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.strokeRect(start.x, start.y, w, h);
    } else if (activeTool === 'circle') {
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const onPaintDown = (e) => {
    const pos = getPaintPos(e);
    if (!pos) return;
    const canvas = paintRef.current;
    const ctx = canvas.getContext('2d');

    if (activeTool === 'eyedropper') {
      const pixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      const hex = `#${[pixel[0], pixel[1], pixel[2]]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')}`;
      setBrushColor?.(hex);
      return;
    }

    if (activeTool === 'fill') {
      floodFill(ctx, pos.x, pos.y, brushColor);
      return;
    }

    if (activeTool === 'text') {
      ctx.fillStyle = brushColor;
      ctx.font = `${textSize * (canvas.width / Math.max(canvas.getBoundingClientRect().width, 1))}px "IBM Plex Sans", sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(textValue || 'Text', pos.x, pos.y);
      return;
    }

    if (activeTool === 'rect' || activeTool === 'line' || activeTool === 'circle') {
      snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      shapeStart.current = pos;
      painting.current = true;
      return;
    }

    painting.current = true;
    lastPoint.current = pos;
  };

  const onPaintMove = (e) => {
    if (!painting.current) return;
    const pos = getPaintPos(e);
    if (activeTool === 'rect' || activeTool === 'line' || activeTool === 'circle') {
      drawShapePreview(pos);
      return;
    }
    stroke(lastPoint.current, pos);
    lastPoint.current = pos;
  };

  const onPaintUp = (e) => {
    if (activeTool === 'rect' || activeTool === 'line' || activeTool === 'circle') {
      const pos = getPaintPos(e);
      if (pos) drawShapePreview(pos);
      shapeStart.current = null;
      snapshot.current = null;
    }
    painting.current = false;
    lastPoint.current = null;
  };

  const commitPaint = () => {
    const canvas = paintRef.current;
    if (!canvas) return;
    const result = canvas.toDataURL('image/png');
    setImage(result);
    setActions(result);
  };

  const handleCrop = async () => {
    if (!cropperRef.current?.cropper || !image) return;

    const cropper = cropperRef.current.cropper;
    const data = cropper.getData();

    try {
      setBackDrop(true);
      const result = await cropImage(image, {
        x: Math.round(data.x),
        y: Math.round(data.y),
        width: Math.round(data.width),
        height: Math.round(data.height),
      });
      setImage(result);
      setActions(result);
      cropper.clear();
      setBackDrop(false);
    } catch (e) {
      console.error('Error cropping image:', e);
      setBackDrop(false);
    }
  };

  const handleRotate = async (angle) => {
    if (!image) return;

    try {
      setBackDrop(true);
      const result = await rotateImage(image, angle);
      setImage(result);
      setActions(result);
      setBackDrop(false);
    } catch (e) {
      console.error('Error rotating image:', e);
      setBackDrop(false);
    }
  };

  const handleCanvasClick = (e) => {
    if (activeTool !== 'zoom') return;
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.zoom(e.shiftKey ? -0.15 : 0.15);
  };

  const getCanvasCursor = () => {
    switch (activeTool) {
      case 'crop':
      case 'brush':
      case 'eraser':
      case 'rect':
      case 'line':
      case 'circle':
      case 'text':
      case 'fill':
        return 'crosshair';
      case 'eyedropper':
        return 'cell';
      case 'hand':
        return 'grab';
      case 'zoom':
        return 'zoom-in';
      default:
        return 'default';
    }
  };

  const applyLabel = () => {
    if (activeTool === 'eraser') return 'Erase';
    if (activeTool === 'text') return 'Text';
    if (activeTool === 'fill') return 'Fill';
    if (['rect', 'line', 'circle'].includes(activeTool)) return 'Shape';
    if (activeTool === 'eyedropper') return null;
    return 'Brush';
  };

  return (
    <Box
      className={`image-canvas ${dragActive ? 'drag-active' : ''} ${darkMode ? 'dark' : 'light'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{ cursor: getCanvasCursor() }}
    >
      <Backdrop
        sx={{
          color: darkMode ? '#ffffff' : '#000000',
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
        }}
        open={backDrop}
      >
        <CircularProgress color="inherit" size={40} thickness={2} />
      </Backdrop>

      {image ? (
        <Box className="canvas-container">
          {activeTool === 'crop' && (
            <Box className="crop-controls">
              <Button
                variant="contained"
                size="small"
                startIcon={<CropIcon />}
                onClick={handleCrop}
                className="crop-apply-btn"
              >
                Apply Crop
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => cropperRef.current?.cropper?.clear()}
                className="crop-cancel-btn"
              >
                Cancel
              </Button>
            </Box>
          )}

          {activeTool === 'select' && (
            <Box className="rotate-controls">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleRotate(-90)}
                className="rotate-btn"
              >
                -90°
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleRotate(90)}
                className="rotate-btn"
              >
                +90°
              </Button>
            </Box>
          )}

          {isDrawTool && applyLabel() && (
            <Box className="crop-controls">
              <Button
                variant="contained"
                size="small"
                onClick={commitPaint}
                className="crop-apply-btn"
              >
                Apply {applyLabel()}
              </Button>
            </Box>
          )}

          {isDrawTool ? (
            <Box className="paint-stage" style={{ transform: `scale(${zoomRatio})` }}>
              <canvas
                ref={paintRef}
                className="paint-canvas"
                onMouseDown={onPaintDown}
                onMouseMove={onPaintMove}
                onMouseUp={onPaintUp}
                onMouseLeave={onPaintUp}
              />
            </Box>
          ) : (
            <Box className="cropper-container" onClick={handleCanvasClick}>
              <Cropper
                src={image}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 280px)',
                  backgroundColor: 'transparent',
                }}
                guides={true}
                ref={cropperRef}
                rotatable={false}
                responsive={true}
                autoCrop={false}
                autoCropArea={0.8}
                background={false}
                movable={true}
                zoomable={true}
                zoomOnWheel={activeTool === 'zoom' || activeTool === 'hand'}
                zoomOnTouch={true}
                checkOrientation={false}
                cropBoxResizable={activeTool === 'crop'}
                cropBoxMovable={activeTool === 'crop'}
                dragMode={
                  activeTool === 'crop'
                    ? 'crop'
                    : activeTool === 'hand'
                      ? 'move'
                      : 'none'
                }
                viewMode={1}
                minContainerWidth={200}
                minContainerHeight={200}
                ready={() => {
                  const cropper = cropperRef.current?.cropper;
                  if (!cropper) return;
                  if (activeTool === 'crop') {
                    cropper.setDragMode('crop');
                    cropper.crop();
                  } else if (activeTool === 'hand') {
                    cropper.setDragMode('move');
                  } else {
                    cropper.setDragMode('none');
                  }
                  try {
                    cropper.zoomTo(zoomRatio);
                  } catch (e) {
                    // ignore
                  }
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Fade in={true}>
          <Box className="upload-placeholder">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="canvas-upload"
            />
            <label htmlFor="canvas-upload" className="upload-label">
              <Box className={`upload-zone ${dragActive ? 'active' : ''}`}>
                <UploadIcon className="upload-icon" />
                <Typography className="upload-title">
                  Drop your image here
                </Typography>
                <Typography className="upload-subtitle">
                  or click to browse
                </Typography>
                <Typography className="upload-hint">
                  JPG · PNG · WEBP
                </Typography>
              </Box>
            </label>
          </Box>
        </Fade>
      )}
    </Box>
  );
}
