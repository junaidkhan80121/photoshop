import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useCallback } from "react";
import NavBar from "./Navbar";
import LeftToolbar from "./LeftToolbar";
import RightPanel from "./RightPanel";
import BottomToolbar from "./BottomToolbar";
import ImageCanvas from "./ImageCanvas";

function App() {
  const [activeTool, setActiveTool] = useState("select");
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [backDrop, setBackDrop] = useState(false);
  const [compressionFactor, setCompressionFactor] = useState(0.8);
  const [activePanel, setActivePanel] = useState("adjust");
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  
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

  // Set image with history tracking
  const handleSetImage = useCallback((newImage) => {
    if (newImage && history.length === 0) {
      setHistory([newImage]);
      setHistoryIndex(0);
    }
    setImage(newImage);
  }, [history.length]);

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
        main: darkMode ? "#a78bfa" : "#7c3aed",
        light: darkMode ? "#c4b5fd" : "#8b5cf6",
        dark: darkMode ? "#8b5cf6" : "#6d28d9",
        contrastText: "#ffffff",
      },
      secondary: {
        main: darkMode ? "#f472b6" : "#ec4899",
        light: darkMode ? "#f9a8d4" : "#f472b6",
        dark: darkMode ? "#ec4899" : "#db2777",
        contrastText: "#ffffff",
      },
      background: {
        default: darkMode ? "#0a0a0f" : "#f8fafc",
        paper: darkMode ? "#13131a" : "#ffffff",
      },
      surface: {
        main: darkMode ? "#1a1a24" : "#f1f5f9",
        dark: darkMode ? "#23232e" : "#e2e8f0",
      },
      text: {
        primary: darkMode ? "#f8fafc" : "#0f172a",
        secondary: darkMode ? "#94a3b8" : "#64748b",
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 600, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600, letterSpacing: "-0.01em" },
      body1: { fontWeight: 400, letterSpacing: "0" },
      body2: { fontWeight: 400, fontSize: "13px" },
      caption: { fontWeight: 500, fontSize: "11px", letterSpacing: "0.02em" },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: "smooth",
            backgroundColor: darkMode ? "#0a0a0f" : "#f8fafc",
          },
        },
      },
    },
  });

  const handleAdjustmentChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

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
            />
            <BottomToolbar 
              darkMode={darkMode}
              activeTool={activeTool}
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
