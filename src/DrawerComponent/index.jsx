import { Alert, Typography, List, ListItem, Box, Accordion, AccordionSummary, AccordionDetails, Slider, Snackbar, IconButton } from '@mui/material'
import { React, useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterIcon from '@mui/icons-material/Filter';
import DeblurIcon from '@mui/icons-material/Deblur';
import ContrastIcon from '@mui/icons-material/Contrast';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CloseIcon from '@mui/icons-material/Close';
import ExposureIcon from '@mui/icons-material/Exposure';
import FlipIcon from '@mui/icons-material/Flip';
import CompressIcon from '@mui/icons-material/Compress';

import axios from 'axios';
import './index.css';


export default function DrawerComponent({ image, setImage, setActions, Actions, setbackDrop }) {
  const filters = [
    { 'title': 'GrayScale', 'filter': 'grayscale', 'image': './filter_preview/grayscale.png' },
    { 'title': 'Emboss', 'filter': 'emboss', 'image': './filter_preview/emboss.png' },
    { 'title': 'Vignette', 'filter': 'vignette', 'image': './filter_preview/vignette.png' },
    { 'title': 'Negative', 'filter': 'negative', 'image': './filter_preview/negative.png' },
    { 'title': 'Cartoon', 'filter': 'cartoon', 'image': './filter_preview/cartoon.png' },
    { 'title': 'Sepia', 'filter': 'sepia', 'image': './filter_preview/sepia.png' }, 
    { 'title': 'Glow', 'filter': 'glow', 'image': './filter_preview/glow.png' },
    { 'title': 'Pencil Sketch', 'filter': 'pencil_sketch', 'image': './filter_preview/pencil_sketch.png' },
    { 'title': 'Oil Painting', 'filter': 'oil_paintintg', 'image': './filter_preview/oil_painting.png' },
    { 'title': 'Solarize', 'filter': 'solarize', 'image': './filter_preview/solarize.png' },
    { 'title': 'Pixelate', 'filter': 'pixelate', 'image': './filter_preview/pixelate.png' },
    { 'title': 'Canny', 'filter': 'canny', 'image': './filter_preview/canny.png' },
    { 'title': 'Heatmap', 'filter': 'heatmap', 'image': './filter_preview/heatmap.png' },
    { 'title': 'HSV', 'filter': 'hsv', 'image': './filter_preview/hsv.png' },
    { 'title': 'Posterize', 'filter': 'posterize', 'image': './filter_preview/posterize.png' },
    
  ]


  const fineTune = [
    { 'title': 'HDR', 'filter': 'hdr', 'image': './filter_preview/hdr.png' },
    { 'title': 'Blur', 'filter': 'blur', 'image': './filter_preview/blur.png' },
    { 'title': 'Sharp', 'filter': 'sharpen', 'image': './filter_preview/sharpen.png' },
  ]

  const mirror = [
    { 'title': 'Flip Horizontally', 'filter': 'flip_horizontal', 'image': './filter_preview/flip_horizontal.png' },
    { 'title': 'Flip Vertically', 'filter': 'flip_vertical', 'image': './filter_preview/flip_vertical.png' },
    { 'title': 'Perspective Warp', 'filter': 'perspective_warp', 'image': './filter_preview/perspective_warp.png' },
    { 'title': 'Transpose', 'filter': 'perspective_warp', 'image': './filter_preview/transpose.png' },
    { 'title': 'Flip Both Axes', 'filter': 'flip_both', 'image': './filter_preview/flip_both.png' },
  ]

  const [snackBar, setsnackBar] = useState(false)


  const getFilter = async (filter) => {
    if (!image)
      alert('please select an image')
    else {
      try {
        setbackDrop(true)
        var response = await axios.post('http://localhost:5000/filter', { filter: filter, image: image })
        setImage(response.data['image'])
        setActions([...Actions, response.data['image']])
        console.log('response data', response.data.image)
        console.log("actions arry: ", Actions)
        setbackDrop(false)
      }
      catch (e) {
        setsnackBar(true)
        console.log('Error', e.message)
        setbackDrop(false)
      }
    }
  }


  return (
    <Box sx={{ height: "90vh", overflowY: "scroll", overflowX: 'hidden' }}>
      <Snackbar

        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        // TransitionComponent='fade'
        autoHideDuration={5000}
        open={snackBar}
        onClose={() => {
          setsnackBar(false);
        }}
      >
        <Alert
          sx={{
            width: "100%", // Ensures the alert fills the snackbar width
          }}
          severity="error"
          variant="filled"
          action={
            <IconButton size="small" onClick={() => setsnackBar(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          Error processing image &emsp;&ensp;
        </Alert>
      </Snackbar>



      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><ExposureIcon />
          <Typography variant='body1'>&emsp;Adjustment</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <Box>
              <Box sx={{ backgroundColor: "", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <ListItem sx={{ textAlign: "center" }}>
                <ContrastIcon sx={{fontSize:"16px"}}/>&nbsp;Contrast
                </ListItem>
                </Box>

              <ListItem sx={{}}>
                <Slider size='small' max={100} min={-100} valueLabelDisplay='auto' defaultValue={0} step={1} />
              </ListItem>
            </Box>
            <ListItem sx={{ textAlign: "center" }}><Brightness5Icon sx={{fontSize:"16px"}}/>&nbsp;Brightness</ListItem>
            <ListItem><Slider size='small' max={100} min={-100} valueLabelDisplay='auto' defaultValue={0} step={1} /></ListItem>
            <ListItem sx={{ textAlign: "center", fontSize:"15px" }}><ColorLensIcon sx={{fontSize:"18px"}} />&nbsp;Color</ListItem>
            <ListItem><Slider size='small' max={100} min={-100} valueLabelDisplay='auto' defaultValue={0} step={1} /></ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Apply filters section */}

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><FilterIcon /><Typography variant='subtitle2'>&emsp;Filters</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ overflowY: 'auto' }}>
          {filters.map((arg, index) => (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer", marginLeft: "1vw" }} index={index}>
              <Box><img style={{ height: "auto", width: "5vw" }} src={arg.image} alt={arg.title} /></Box>
              <Box><ListItem onClick={() => { getFilter(arg.filter) }} index={index}><Typography className='sub-category-font'>{arg.title}</Typography>&ensp;</ListItem></Box>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>


      {/* Fine Tuning Section. Sharpen, blur images */}


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><DeblurIcon /><Typography variant='subtitle2'>&emsp;Tuning</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {fineTune.map((arg, index) => (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} index={index}>
              <Box><img style={{ height: "auto", width: "5vw" }} src={arg.image} alt={arg.title} /></Box>
              <Box><ListItem onClick={() => { getFilter(arg.filter) }} index={index}>{arg.title}&ensp;</ListItem></Box>
            </Box>
          ))}

        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><FlipIcon /><Typography variant='subtitle2'>&emsp;Flip & Mirror</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {mirror.map((arg, index) => (
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} index={index}>
              <Box><img style={{ height: "auto", width: "5vw" }} src={arg.image} alt={arg.title} /></Box>
              <Box><ListItem onClick={() => { getFilter(arg.filter) }} index={index}>{arg.title}&ensp;</ListItem></Box>
            </Box>
          ))}

        </AccordionDetails>
      </Accordion>


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon/>}><CompressIcon/>
          <Typography variant='subtitle2'>&emsp;Compress</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>

          </Box>
        </AccordionDetails>
      </Accordion>



    </Box>
  )
}