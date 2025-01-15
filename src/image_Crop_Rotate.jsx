import React, { useState, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Slider, Box, Button, Typography, Backdrop, MenuItem, Select } from "@mui/material";
import Grid from "@mui/material/Grid2";
import DrawerComponent from "./DrawerComponent";
import ReplayIcon from '@mui/icons-material/Replay';
import './image_Crop_Rotate.css';
import { Mosaic } from 'react-loading-indicators';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

const ImageCropper = ({ darkMode }) => {
  const [image, setImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const cropperRef = useRef(null); // Reference for the cropper instance
  const [Actions, setActions] = useState([]);
  const [backDrop, setbackDrop] = useState(false);
  const [format, setFormat] = useState("jpeg"); // State for selected image format

  const undoAction = () => {
    if (Actions.length > 1) {
      setActions(Actions.slice(0, Actions.length - 1)); // Remove the last action
      setImage(Actions[Actions.length - 2]); // Set the previous image as the current image
    } else {
      console.log("Already at the original image");
    }
  }

  // Handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalImage = e.target.result;
        setImage(originalImage);
        setActions([originalImage]); // Add the original image to the Actions array
      };
      reader.readAsDataURL(file);
    }
  };
  

  // Handle file upload via drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Function to download the cropped image
  const downloadCroppedImage = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        const croppedImageURL = canvas.toDataURL(`image/${format}`);

        // Create a download link
        const link = document.createElement("a");
        link.href = croppedImageURL;
        link.download = `final_image.${format}`;
        link.click();
      }
    }
  };

  const rotateImage = (angle) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(angle);
      setRotation((prev) => prev + angle);
    }
  };

  // Handle slider change for custom rotation
  const handleSliderChange = (e, newValue) => {
    setRotation(newValue);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotateTo(newValue);
    }
  };

  return (
    <Box className={darkMode ? "dark" : "light"}>
      <Grid container>
        <Grid size={{ xs: 12, sm: 12, md: 2, lg: 2 }}>
          <DrawerComponent
            setbackDrop={setbackDrop}
            image={image}
            setImage={setImage}
            setActions={setActions}
            Actions={Actions}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 10, lg: 10 }}>
          {!image ? (
            <Box className="drag-drop-box-container">
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="drag-drop-box"
              >
                <Typography variant="h6">
                  Drag and drop an image here, or click to select
                </Typography>
                <input
                  type="file"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  style={{ cursor: "pointer", color: "#1976d2", marginTop: "10px" }}
                >
                  <Typography>Click To Upload</Typography>
                </label>
              </Box>
            </Box>
          ) : (
            <>
              <Box
                className='cropper-box-container'
              >
                <Cropper
                  src={image}
                  style={{ maxWidth: "100%", maxHeight: "60vh", marginTop: "5vh", backgroundColor:"lightgray" }}
                  guides={true}
                  ref={cropperRef}
                  rotatable={true}
                  responsive={true}
                  autoCropArea={0.8}
                  background={false}
                  // brightness={100}
                  movable={true}
                  zoomable={true}
                  checkOrientation={false}
                  cropBoxResizable={true}
                  cropBoxMovable={true}
                />
              </Box>
              <Box sx={{ textAlign: "center", marginTop: "5vh" }}>
                <Box sx={{ marginTop: "40px" }}>
                  <Typography gutterBottom>Rotate Image</Typography>
                  <Slider
                    value={rotation}
                    min={-360}
                    max={360}
                    step={1}
                    size="small"
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}°`}
                    sx={{ width: 500, marginBottom: "10px" }}
                  />
                </Box>

                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => {
                      setImage(null);
                    }}
                    endIcon={<DeleteIcon />}
                  >
                    Delete Image
                  </Button>
                  <Button
                    disabled={Actions.length === 1}
                    size="small"
                    onClick={() => {
                      undoAction();
                    }}
                    sx={{ marginRight: 1, marginLeft: 1 }}
                    variant="contained"
                    color="warning"
                    endIcon={<ReplayIcon/>}
                  >
                    Undo
                  </Button>

                  <Button
                    onClick={() => rotateImage(90)}
                    size="small"
                    variant="contained"
                    sx={{ marginRight: 1 }}
                    endIcon={<RotateRightIcon/>}
                  >
                    Rotate +90°
                  </Button>
                  <Button
                  endIcon={<RotateLeftIcon/>}
                    onClick={() => rotateImage(-90)}
                    size="small"
                    variant="contained"
                    sx={{ marginRight: 1 }}
                  >
                    Rotate -90°
                  </Button>
                  <Button
                    endIcon={<RotateRightIcon/>}
                    onClick={() => rotateImage(45)}
                    size="small"
                    variant="contained"
                    sx={{ marginRight: 1 }}
                  >
                    Rotate +45°
                  </Button>
                  <Button
                    endIcon={<RotateLeftIcon/>}
                    onClick={() => rotateImage(-45)}
                    size="small"
                    variant="contained"
                  >
                    Rotate -45°
                  </Button>
                </Box>

                <Box sx={{ marginTop: "10px" }}>
                  <Typography gutterBottom>Select Download Format:</Typography>
                  <Select
                    value={format}
                    // size='small'
                    onChange={(e) => setFormat(e.target.value)}
                    size="small"
                    sx={{ marginBottom: "10px" }}
                  >
                    <MenuItem value="jpeg">JPEG</MenuItem>
                    <MenuItem value="png">PNG</MenuItem>
                    <MenuItem value="webp">WEBP</MenuItem>
                  </Select>
                  <Button endIcon={<DownloadIcon/>} sx={{ marginLeft: "15px" }} size="small" color='success' variant="contained" onClick={downloadCroppedImage}>
                    Download Cropped Image
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Grid>
      </Grid>
      <Backdrop open={backDrop}>
        <Mosaic color="#2196f3" size="small" text="Processing..." textColor="" />
      </Backdrop>
    </Box>
  );
};

export default ImageCropper;
