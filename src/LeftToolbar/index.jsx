import React, { useEffect } from 'react';
import { Tooltip, IconButton, Box, Drawer, Divider, useMediaQuery, useTheme } from '@mui/material';
import {
  ChevronLeft as CloseIcon,
  AdsClick as SelectIcon,
  Crop as CropIcon,
  Brush as BrushIcon,
  AutoFixNormal as EraserIcon,
  ZoomIn as ZoomIcon,
  PanTool as HandIcon,
  Flip as FlipHIcon,
  SwapVert as FlipVIcon,
  RotateRight as RotateIcon,
  Title as TextIcon,
  CropSquare as RectIcon,
  Timeline as LineIcon,
  RadioButtonUnchecked as CircleIcon,
  FormatColorFill as FillIcon,
  Colorize as EyedropperIcon,
  InvertColors as InvertIcon,
  FilterBAndW as GrayIcon,
  BlurOn as BlurIcon,
  AutoFixHigh as SharpenIcon,
} from '@mui/icons-material';
import './index.css';

/** Mode tools — stay selected */
const MODE_TOOLS = [
  { id: 'select', name: 'Select / Rotate', icon: SelectIcon, shortcut: 'V' },
  { id: 'crop', name: 'Crop', icon: CropIcon, shortcut: 'C' },
  { id: 'brush', name: 'Brush', icon: BrushIcon, shortcut: 'B' },
  { id: 'eraser', name: 'Eraser', icon: EraserIcon, shortcut: 'E' },
  { id: 'fill', name: 'Paint Bucket', icon: FillIcon, shortcut: 'G' },
  { id: 'eyedropper', name: 'Eyedropper', icon: EyedropperIcon, shortcut: 'I' },
  { id: 'text', name: 'Text', icon: TextIcon, shortcut: 'T' },
  { id: 'rect', name: 'Rectangle', icon: RectIcon, shortcut: 'U' },
  { id: 'line', name: 'Line', icon: LineIcon, shortcut: 'L' },
  { id: 'circle', name: 'Ellipse', icon: CircleIcon, shortcut: 'O' },
  { id: 'hand', name: 'Hand (pan)', icon: HandIcon, shortcut: 'H' },
  { id: 'zoom', name: 'Zoom', icon: ZoomIcon, shortcut: 'Z' },
];

/** Instant actions — run once, don't stay selected */
const ACTION_TOOLS = [
  { id: 'flipH', name: 'Flip Horizontal', icon: FlipHIcon, shortcut: 'F' },
  { id: 'flipV', name: 'Flip Vertical', icon: FlipVIcon, shortcut: 'Shift+F' },
  { id: 'rotate90', name: 'Rotate 90° CW', icon: RotateIcon, shortcut: 'R' },
  { id: 'invert', name: 'Invert Colors', icon: InvertIcon, shortcut: 'N' },
  { id: 'grayscale', name: 'Black & White', icon: GrayIcon, shortcut: 'D' },
  { id: 'blur', name: 'Blur', icon: BlurIcon, shortcut: 'M' },
  { id: 'sharpen', name: 'Sharpen', icon: SharpenIcon, shortcut: 'S' },
];

const ALL_SHORTCUTS = [...MODE_TOOLS, ...ACTION_TOOLS];

export default function LeftToolbar({
  activeTool,
  setActiveTool,
  darkMode,
  isOpen,
  onClose,
  onAction,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToolClick = (tool) => {
    if (tool.action || ACTION_TOOLS.some((t) => t.id === tool.id)) {
      onAction?.(tool.id);
      if (isMobile && onClose) onClose();
      return;
    }
    setActiveTool(tool.id);
    if (isMobile && onClose) onClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Shift+F → flip vertical
      if (e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onAction?.('flipV');
        return;
      }

      const key = e.key.toLowerCase();
      const match = ALL_SHORTCUTS.find(
        (t) => t.shortcut.toLowerCase() === key && !t.shortcut.includes('+')
      );
      if (!match) return;
      e.preventDefault();
      handleToolClick(match);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, onAction]);

  const renderGroup = (items) =>
    items.map((tool) => {
      const IconComponent = tool.icon;
      const isActive = activeTool === tool.id;
      const isAction = ACTION_TOOLS.some((t) => t.id === tool.id);

      return (
        <Tooltip
          key={tool.id}
          title={`${tool.name} (${tool.shortcut})`}
          placement="right"
          arrow
        >
          <IconButton
            className={`toolbar-button ${isActive && !isAction ? 'active' : ''} ${isAction ? 'action' : ''}`}
            onClick={() => handleToolClick(tool)}
            size="small"
          >
            <IconComponent className="toolbar-icon" />
            {isActive && !isAction && <Box className="active-indicator" />}
          </IconButton>
        </Tooltip>
      );
    });

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

      <Box className="toolbar-scroll">
        <Box className="toolbar-top">
          <span className="tool-group-label">Edit</span>
          {renderGroup(MODE_TOOLS.slice(0, 2))}
          <Divider className="tool-divider" flexItem />
          <span className="tool-group-label">Paint</span>
          {renderGroup(MODE_TOOLS.slice(2, 6))}
          <Divider className="tool-divider" flexItem />
          <span className="tool-group-label">Draw</span>
          {renderGroup(MODE_TOOLS.slice(6, 10))}
          <Divider className="tool-divider" flexItem />
          <span className="tool-group-label">View</span>
          {renderGroup(MODE_TOOLS.slice(10))}
          <Divider className="tool-divider" flexItem />
          <span className="tool-group-label">Quick</span>
          {renderGroup(ACTION_TOOLS)}
        </Box>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        className="left-toolbar-drawer"
        PaperProps={{
          className: `left-toolbar mobile ${darkMode ? 'dark' : 'light'}`,
        }}
      >
        {toolbarContent}
      </Drawer>
    );
  }

  return (
    <Box className={`left-toolbar ${darkMode ? 'dark' : 'light'}`}>
      {toolbarContent}
    </Box>
  );
}
