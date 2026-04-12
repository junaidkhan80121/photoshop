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
  Tooltip,
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
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import './navbar.css';

export default function NavBar({ darkMode, setDarkMode, image, setImage, onToggleLeftPanel, onToggleRightPanel, onUndo, onRedo, canUndo, canRedo }) {
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
            <ListItem button onClick={() => { onUndo?.(); setMobileMenuOpen(false); }} disabled={!canUndo}>
              <ListItemText primary="Undo" />
            </ListItem>
            <ListItem button onClick={() => { onRedo?.(); setMobileMenuOpen(false); }} disabled={!canRedo}>
              <ListItemText primary="Redo" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => { setDarkMode(!darkMode); }}>
              <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
              <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
                {darkMode ? '☀️' : '🌙'}
              </span>
            </ListItem>
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
                  {menu === 'edit' && (
                    <>
                      <MenuItem onClick={() => { onUndo?.(); handleMenuClose('edit'); }} disabled={!canUndo}>
                        Undo <span style={{ marginLeft: 'auto', marginRight: 8, opacity: 0.6, fontSize: 12 }}>Ctrl+Z</span>
                      </MenuItem>
                      <MenuItem onClick={() => { onRedo?.(); handleMenuClose('edit'); }} disabled={!canRedo}>
                        Redo <span style={{ marginLeft: 'auto', marginRight: 8, opacity: 0.6, fontSize: 12 }}>Ctrl+Shift+Z</span>
                      </MenuItem>
                      <Divider className="menu-divider" />
                      <MenuItem onClick={() => handleMenuClose('edit')}>Cut</MenuItem>
                      <MenuItem onClick={() => handleMenuClose('edit')}>Copy</MenuItem>
                      <MenuItem onClick={() => handleMenuClose('edit')}>Paste</MenuItem>
                      <Divider className="menu-divider" />
                      <MenuItem onClick={() => handleMenuClose('edit')}>Preferences</MenuItem>
                    </>
                  )}
                  {menu === 'view' && (
                    <>
                      {menuItems[menu].map((item) => (
                        <MenuItem key={item} onClick={() => handleMenuClose(menu)}>
                          {item}
                        </MenuItem>
                      ))}
                      <Divider className="menu-divider" />
                      <MenuItem onClick={() => { setDarkMode(!darkMode); handleMenuClose('view'); }}>
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                        <span style={{ marginLeft: 'auto', marginRight: 8, opacity: 0.6, fontSize: 12 }}>
                          {darkMode ? '☀️' : '🌙'}
                        </span>
                      </MenuItem>
                    </>
                  )}
                  {menu !== 'file' && menu !== 'edit' && menu !== 'view' && menuItems[menu].map((item) => (
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
          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              className="navbar-icon-button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

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
