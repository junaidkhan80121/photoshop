import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useCallback, useEffect } from "react";
import NavBar from "./Navbar";
import LeftToolbar from "./LeftToolbar";
import RightPanel from "./RightPanel";
import BottomToolbar from "./BottomToolbar";
import ImageCanvas from "./ImageCanvas";
import { flipImage, rotateImage, applyFilter } from "./utils/imageProcessing";

function App() {
  const [activeTool, setActiveTool] = useState("select");
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [backDrop, setBackDrop] = useState(false);
  const [compressionFactor, setCompressionFactor] = useState(0.8);
  const [exportFormat, setExportFormat] = useState("jpeg");
  const [activePanel, setActivePanel] = useState("adjust");
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [brushSize, setBrushSize] = useState(24);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(48);
  const [textValue, setTextValue] = useState("Text");
  
  // Adjustment values
  const [adjustments, setAdjustments] = useState({
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
  });

  const checkThemeMode = useCallback(() => {
    let mode = localStorage.getItem("darkMode");
    if (!mode) {
      mode = "true";
      localStorage.setItem("darkMode", mode);
    }
    return mode === "true";
  }, []);

  const [darkMode, setDarkMode] = useState(checkThemeMode());

  // Add image to history
  const addToHistory = useCallback((newImage) => {
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newImage);
      // Keep only last 20 items
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setImage(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setImage(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Set image with history tracking (initial upload / direct set)
  const handleSetImage = useCallback((newImage) => {
    if (newImage && history.length === 0) {
      setHistory([newImage]);
      setHistoryIndex(0);
    }
    setImage(newImage);
  }, [history.length]);

  const handleToolAction = useCallback(async (actionId) => {
    if (!image) return;
    try {
      setBackDrop(true);
      let result = null;
      switch (actionId) {
        case "flipH":
          result = await flipImage(image, "horizontal");
          break;
        case "flipV":
          result = await flipImage(image, "vertical");
          break;
        case "rotate90":
          result = await rotateImage(image, 90);
          break;
        case "invert":
          result = await applyFilter(image, "negative");
          break;
        case "grayscale":
          result = await applyFilter(image, "grayscale");
          break;
        case "blur":
          result = await applyFilter(image, "blur");
          break;
        case "sharpen":
          result = await applyFilter(image, "sharpen");
          break;
        default:
          break;
      }
      if (result) {
        setImage(result);
        addToHistory(result);
      }
      setBackDrop(false);
    } catch (e) {
      console.error("Tool action failed:", e);
      setBackDrop(false);
    }
  }, [image, addToHistory]);

  // Toggle left panel (for mobile)
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelOpen(prev => !prev);
    setRightPanelOpen(false);
  }, []);

  // Toggle right panel (for mobile)
  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen(prev => !prev);
    setLeftPanelOpen(false);
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#ffffff" : "#000000",
        light: darkMode ? "#e5e5e5" : "#262626",
        dark: darkMode ? "#a3a3a3" : "#000000",
        contrastText: darkMode ? "#000000" : "#ffffff",
      },
      secondary: {
        main: darkMode ? "#a3a3a3" : "#525252",
        light: darkMode ? "#d4d4d4" : "#737373",
        dark: darkMode ? "#737373" : "#262626",
        contrastText: darkMode ? "#000000" : "#ffffff",
      },
      background: {
        default: darkMode ? "#000000" : "#ffffff",
        paper: darkMode ? "#0a0a0a" : "#fafafa",
      },
      surface: {
        main: darkMode ? "#111111" : "#f5f5f5",
        dark: darkMode ? "#1a1a1a" : "#eeeeee",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#0a0a0a",
        secondary: darkMode ? "#a3a3a3" : "#525252",
      },
    },
    typography: {
      fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      h1: { fontWeight: 600, letterSpacing: "-0.03em" },
      h2: { fontWeight: 600, letterSpacing: "-0.02em" },
      h3: { fontWeight: 500, letterSpacing: "-0.01em" },
      h6: { fontWeight: 500, letterSpacing: "-0.01em" },
      body1: { fontWeight: 400, letterSpacing: "0" },
      body2: { fontWeight: 400, fontSize: "12px" },
      caption: { fontWeight: 500, fontSize: "10px", letterSpacing: "0.06em" },
    },
    shape: {
      borderRadius: 0,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: "smooth",
            backgroundColor: darkMode ? "#000000" : "#ffffff",
          },
        },
      },
    },
  });

  const handleAdjustmentChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  // Persist dark mode to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          handleUndo();
        }
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length, handleUndo, handleRedo]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`app-container ${darkMode ? "dark" : "light"}`}>
        <NavBar 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          image={image}
          setImage={handleSetImage}
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          compressionFactor={compressionFactor}
          exportFormat={exportFormat}
          onOpenExport={() => {
            setActivePanel("export");
            setRightPanelOpen(true);
          }}
        />
        <div className="main-layout">
          {/* Overlay for mobile panels */}
          {(leftPanelOpen || rightPanelOpen) && (
            <div 
              className="panel-overlay active"
              onClick={() => {
                setLeftPanelOpen(false);
                setRightPanelOpen(false);
              }}
            />
          )}
          
          <LeftToolbar 
            activeTool={activeTool} 
            setActiveTool={setActiveTool}
            darkMode={darkMode}
            isOpen={leftPanelOpen}
            onClose={() => setLeftPanelOpen(false)}
            onAction={handleToolAction}
          />
          <div className="canvas-area">
            <ImageCanvas 
              image={image}
              setImage={handleSetImage}
              setActions={addToHistory}
              Actions={history}
              setBackDrop={setBackDrop}
              backDrop={backDrop}
              activeTool={activeTool}
              darkMode={darkMode}
              zoom={zoom}
              brushSize={brushSize}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              textSize={textSize}
              textValue={textValue}
            />
            <BottomToolbar 
              darkMode={darkMode}
              activeTool={activeTool}
              zoom={zoom}
              setZoom={setZoom}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              textSize={textSize}
              setTextSize={setTextSize}
              textValue={textValue}
              setTextValue={setTextValue}
            />
          </div>
          <RightPanel 
            darkMode={darkMode}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            adjustments={adjustments}
            setAdjustments={handleAdjustmentChange}
            image={image}
            setImage={handleSetImage}
            setActions={addToHistory}
            Actions={history}
            setBackDrop={setBackDrop}
            compressionFactor={compressionFactor}
            setCompressionFactor={setCompressionFactor}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isOpen={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
