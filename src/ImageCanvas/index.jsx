import React, { useCallback, useState } from 'react';
import { Box, Typography, Fade, Backdrop, CircularProgress } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import ImageCropper from '../Cropper';
import './index.css';

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

  return (
    <Box
      className={`image-canvas ${dragActive ? 'drag-active' : ''} ${darkMode ? 'dark' : 'light'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
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
          <ImageCropper
            src={image}
            setBackDrop={setBackDrop}
            setImage={setImage}
            setActions={setActions}
            Actions={Actions}
            activeTool={activeTool}
            darkMode={darkMode}
          />
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
