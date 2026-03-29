import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Menu,
  MenuItem,
  IconButton,
  Box,
  Divider
} from '@mui/material';
import {
  Share as ShareIcon,
  Download as DownloadIcon,
  ArrowDropDown as ArrowDropDownIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import './navbar.css';

export default function NavBar({ darkMode, setDarkMode, image, setImage }) {
  const [menuAnchors, setMenuAnchors] = useState({
    file: null,
    edit: null,
    image: null,
    layer: null,
    filter: null,
    view: null,
  });

  const handleMenuOpen = (menu, event) => {
    setMenuAnchors(prev => ({ ...prev, [menu]: event.currentTarget }));
  };

  const handleMenuClose = (menu) => {
    setMenuAnchors(prev => ({ ...prev, [menu]: null }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    handleMenuClose('file');
  };

  const handleExport = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'edited-image.png';
      link.click();
    }
    handleMenuClose('file');
  };

  const menuItems = {
    file: ['New', 'Open', 'Save', 'Save As', 'Export', 'Exit'],
    edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Preferences'],
    image: ['Mode', 'Adjustments', 'Auto Tone', 'Auto Contrast', 'Auto Color'],
    layer: ['New Layer', 'Duplicate Layer', 'Delete Layer', 'Layer Style', 'Merge Down'],
    filter: ['Last Filter', 'Convert for Smart Filters', 'Filter Gallery', 'Lens Correction'],
    view: ['Fit on Screen', 'Actual Pixels', 'Zoom In', 'Zoom Out', 'Rulers', 'Grid'],
  };

  return (
    <AppBar position="static" className="navbar" elevation={0}>
      <Toolbar className="navbar-toolbar">
        {/* Logo */}
        <Box className="navbar-brand">
          <Typography className="navbar-logo">
            Obsidian Lens
          </Typography>
        </Box>

        {/* Menu Items */}
        <Box className="navbar-menus">
          {Object.keys(menuItems).map((menu) => (
            <React.Fragment key={menu}>
              <Button
                className="navbar-menu-button"
                onClick={(e) => handleMenuOpen(menu, e)}
                endIcon={<ArrowDropDownIcon className="menu-arrow" />}
              >
                {menu.charAt(0).toUpperCase() + menu.slice(1)}
              </Button>
              <Menu
                anchorEl={menuAnchors[menu]}
                open={Boolean(menuAnchors[menu])}
                onClose={() => handleMenuClose(menu)}
                className="navbar-dropdown"
                PaperProps={{
                  className: 'dropdown-paper'
                }}
              >
                {menu === 'file' && (
                  <>
                    <MenuItem onClick={() => handleMenuClose('file')}>New</MenuItem>
                    <MenuItem>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        Open...
                      </label>
                    </MenuItem>
                    <Divider className="menu-divider" />
                    <MenuItem onClick={handleExport}>Export</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('file')}>Save</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('file')}>Save As...</MenuItem>
                    <Divider className="menu-divider" />
                    <MenuItem onClick={() => handleMenuClose('file')}>Exit</MenuItem>
                  </>
                )}
                {menu !== 'file' && menuItems[menu].map((item) => (
                  <MenuItem key={item} onClick={() => handleMenuClose(menu)}>
                    {item}
                  </MenuItem>
                ))}
              </Menu>
            </React.Fragment>
          ))}
        </Box>

        {/* Right Actions */}
        <Box className="navbar-actions">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="upload-input"
          />
          <label htmlFor="upload-input">
            <IconButton 
              component="span"
              className="navbar-icon-button"
              title="Upload Image"
            >
              <UploadIcon />
            </IconButton>
          </label>
          <Button 
            className="navbar-action-button share-button"
            startIcon={<ShareIcon />}
          >
            Share
          </Button>
          <Button 
            variant="contained"
            className="navbar-action-button export-button"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
