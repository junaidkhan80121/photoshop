import React, { useCallback, useState, useRef } from 'react';
import { Box, Typography, Fade, Backdrop, CircularProgress, Button } from '@mui/material';
import { CloudUpload as UploadIcon, CropFree as CropIcon } from '@mui/icons-material';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import axios from 'axios';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ImageCanvas({
  image,
  setImage,
  setActions,
  Actions,
  setBackDrop,
  backDrop,
  activeTool,
  darkMode,
}) {
  const [dragActive, setDragActive] = useState(false);
  const cropperRef = useRef(null);

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

  const handleCrop = async () => {
    if (!cropperRef.current?.cropper || !image) return;
    
    const cropper = cropperRef.current.cropper;
    const data = cropper.getData();
    
    try {
      setBackDrop(true);
      const response = await axios.post(`${API_URL}/crop`, {
        image: image,
        x: Math.round(data.x),
        y: Math.round(data.y),
        width: Math.round(data.width),
        height: Math.round(data.height),
      });
      
      if (response.data && response.data.image) {
        setImage(response.data.image);
        setActions(prev => [...prev, response.data.image]);
        // Clear crop selection
        cropper.clear();
      }
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
      const response = await axios.post(`${API_URL}/rotate`, {
        image: image,
        angle: angle,
      });
      
      if (response.data && response.data.image) {
        setImage(response.data.image);
        setActions(prev => [...prev, response.data.image]);
      }
      setBackDrop(false);
    } catch (e) {
      console.error('Error rotating image:', e);
      setBackDrop(false);
    }
  };

  const getCanvasCursor = () => {
    switch (activeTool) {
      case 'crop':
        return 'crosshair';
      case 'hand':
        return 'grab';
      case 'zoom':
        return 'zoom-in';
      default:
        return 'default';
    }
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
          color: '#a78bfa',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
        open={backDrop}
      >
        <CircularProgress color="inherit" size={48} />
      </Backdrop>

      {image ? (
        <Box className="canvas-container">
          {/* Crop Controls */}
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
          
          {/* Rotate Controls */}
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

          <Box className="cropper-container">
            <Cropper
              src={image}
              style={{ 
                maxWidth: "100%", 
                maxHeight: "calc(100vh - 280px)",
                backgroundColor: "transparent"
              }}
              guides={true}
              ref={cropperRef}
              rotatable={false}
              responsive={true}
              autoCrop={activeTool === 'crop'}
              autoCropArea={0.8}
              background={false}
              movable={activeTool === 'hand'}
              zoomable={activeTool === 'zoom'}
              checkOrientation={false}
              cropBoxResizable={activeTool === 'crop'}
              cropBoxMovable={activeTool === 'crop'}
              dragMode={activeTool === 'crop' ? 'crop' : activeTool === 'hand' ? 'move' : 'none'}
              viewMode={1}
              minContainerWidth={200}
              minContainerHeight={200}
              ready={() => {
                if (activeTool === 'crop') {
                  cropperRef.current?.cropper?.crop();
                }
              }}
            />
          </Box>
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
                  Supports JPG, PNG, WebP
                </Typography>
              </Box>
            </label>
          </Box>
        </Fade>
      )}
    </Box>
  );
}
