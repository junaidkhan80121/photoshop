import React from 'react';
import { Tooltip, IconButton, Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import {
  ChevronLeft as CloseIcon,
  AdsClick as SelectIcon,
  Crop as CropIcon,
  Brush as BrushIcon,
  AutoFixNormal as EraserIcon,
  Title as TextIcon,
  Gradient as GradIcon,
  ZoomIn as ZoomIcon,
  PanTool as HandIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import './index.css';

const tools = [
  { id: 'select', name: 'Select', icon: SelectIcon, shortcut: 'V' },
  { id: 'crop', name: 'Crop', icon: CropIcon, shortcut: 'C' },
  { id: 'brush', name: 'Brush', icon: BrushIcon, shortcut: 'B' },
  { id: 'eraser', name: 'Eraser', icon: EraserIcon, shortcut: 'E' },
  { id: 'text', name: 'Text', icon: TextIcon, shortcut: 'T' },
  { id: 'grad', name: 'Gradient', icon: GradIcon, shortcut: 'G' },
  { id: 'zoom', name: 'Zoom', icon: ZoomIcon, shortcut: 'Z' },
  { id: 'hand', name: 'Hand', icon: HandIcon, shortcut: 'H' },
];

const bottomTools = [
  { id: 'settings', name: 'Settings', icon: SettingsIcon },
  { id: 'help', name: 'Help', icon: HelpIcon },
];

export default function LeftToolbar({ activeTool, setActiveTool, darkMode, isOpen, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToolClick = (toolId) => {
    setActiveTool(toolId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toolbarContent = (
    <>
      {isMobile && (
        <Box className="mobile-toolbar-header">
          <span className="mobile-toolbar-title">Tools</span>
          <IconButton onClick={onClose} size="small" className="mobile-close-btn">
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      <Box className="toolbar-top">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Tooltip
              key={tool.id}
              title={`${tool.name} (${tool.shortcut})`}
              placement={isMobile ? "right" : "right"}
              arrow
            >
              <IconButton
                className={`toolbar-button ${isActive ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
                size="small"
              >
                <IconComponent className="toolbar-icon" />
                {isActive && <Box className="active-indicator" />}
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
      
      <Box className="toolbar-bottom">
        {bottomTools.map((tool) => {
          const IconComponent = tool.icon;
          
          return (
            <Tooltip
              key={tool.id}
              title={tool.name}
              placement="right"
              arrow
            >
              <IconButton
                className="toolbar-button"
                size="small"
              >
                <IconComponent className="toolbar-icon" />
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
    </>
  );

  // Mobile drawer version
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        className="left-toolbar-drawer"
        PaperProps={{
          className: `left-toolbar mobile ${darkMode ? 'dark' : 'light'}`
        }}
      >
        {toolbarContent}
      </Drawer>
    );
  }

  // Desktop version
  return (
    <Box className={`left-toolbar ${darkMode ? 'dark' : 'light'}`}>
      {toolbarContent}
    </Box>
  );
}
