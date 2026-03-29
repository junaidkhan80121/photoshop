import React from 'react';
import { Tooltip, IconButton, Box } from '@mui/material';
import {
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

export default function LeftToolbar({ activeTool, setActiveTool, darkMode }) {
  return (
    <Box className={`left-toolbar ${darkMode ? 'dark' : 'light'}`}>
      <Box className="toolbar-top">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Tooltip
              key={tool.id}
              title={`${tool.name} (${tool.shortcut})`}
              placement="right"
              arrow
            >
              <IconButton
                className={`toolbar-button ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
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
    </Box>
  );
}
