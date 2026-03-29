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
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Share as ShareIcon,
  Download as DownloadIcon,
  ArrowDropDown as ArrowDropDownIcon,
  CloudUpload as UploadIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import './navbar.css';

export default function NavBar({ darkMode, setDarkMode, image, setImage, onToggleLeftPanel, onToggleRightPanel }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [menuAnchors, setMenuAnchors] = useState({
    file: null,
    edit: null,
    image: null,
    layer: null,
    filter: null,
    view: null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const handleExport = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'edited-image.png';
      link.click();
    }
    handleMenuClose('file');
    setMobileMenuOpen(false);
  };

  const menuItems = {
    file: ['New', 'Open', 'Save', 'Save As', 'Export', 'Exit'],
    edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Preferences'],
    image: ['Mode', 'Adjustments', 'Auto Tone', 'Auto Contrast', 'Auto Color'],
    layer: ['New Layer', 'Duplicate Layer', 'Delete Layer', 'Layer Style', 'Merge Down'],
    filter: ['Last Filter', 'Convert for Smart Filters', 'Filter Gallery', 'Lens Correction'],
    view: ['Fit on Screen', 'Actual Pixels', 'Zoom In', 'Zoom Out', 'Rulers', 'Grid'],
  };

  const mobileMenuItems = [
    { label: 'File', hasSubmenu: true },
    { label: 'Edit', hasSubmenu: true },
    { label: 'Image', hasSubmenu: true },
    { label: 'Layer', hasSubmenu: true },
    { label: 'Filter', hasSubmenu: true },
    { label: 'View', hasSubmenu: true },
  ];

  return (
    <AppBar position="static" className="navbar" elevation={0}>
      <Toolbar className="navbar-toolbar">
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            size="small"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Drawer Menu */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          className="mobile-drawer"
        >
          <Box className="mobile-drawer-header">
            <Typography className="mobile-drawer-title">Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Divider />
          <List className="mobile-menu-list">
            <ListItem button onClick={() => { onToggleLeftPanel?.(); setMobileMenuOpen(false); }}>
              <ListItemText primary="Tools" />
            </ListItem>
            <ListItem button onClick={() => { onToggleRightPanel?.(); setMobileMenuOpen(false); }}>
              <ListItemText primary="Adjustments" />
            </ListItem>
            <Divider />
            {mobileMenuItems.map((item) => (
              <ListItem button key={item.label}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider />
            <ListItem>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="mobile-upload-input"
              />
              <label htmlFor="mobile-upload-input" style={{ width: '100%' }}>
                <Button fullWidth startIcon={<UploadIcon />} component="span">
                  Upload Image
                </Button>
              </label>
            </ListItem>
          </List>
        </Drawer>

        {/* Logo */}
        <Box className="navbar-brand">
          <Typography className="navbar-logo">
            Obsidian Lens
          </Typography>
        </Box>

        {/* Desktop Menu Items */}
        {!isSmallMobile && (
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
        )}

        {/* Right Actions */}
        <Box className="navbar-actions">
          {!isMobile && (
            <>
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
            </>
          )}
          
          {!isSmallMobile && (
            <Button 
              className="navbar-action-button share-button"
              startIcon={<ShareIcon />}
            >
              Share
            </Button>
          )}
          
          <Button 
            variant="contained"
            className="navbar-action-button export-button"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            {isSmallMobile ? 'Export' : 'Export'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
