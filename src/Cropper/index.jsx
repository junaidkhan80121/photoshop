import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Box } from "@mui/material";
import './index.css';

const ImageCropper = ({ 
  src, 
  setBackDrop, 
  setImage, 
  setActions, 
  Actions, 
  activeTool,
  darkMode 
}) => {
  const cropperRef = useRef(null);

  useEffect(() => {
    if (activeTool === 'crop' && cropperRef.current?.cropper) {
      cropperRef.current.cropper.crop();
    } else if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.clear();
    }
  }, [activeTool]);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && activeTool === 'crop') {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        const croppedImage = croppedCanvas.toDataURL();
        setImage(croppedImage);
        setActions([...Actions, croppedImage]);
      }
    }
  };

  return (
    <Box className={`cropper-wrapper ${darkMode ? 'dark' : 'light'}`}>
      <Cropper
        src={src}
        style={{ 
          maxWidth: "100%", 
          maxHeight: "calc(100vh - 200px)",
          backgroundColor: "transparent"
        }}
        guides={true}
        ref={cropperRef}
        rotatable={true}
        responsive={true}
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
        cropend={handleCrop}
      />
    </Box>
  );
};

export default ImageCropper;
