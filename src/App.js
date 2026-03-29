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
  const [actions, setActions] = useState([]);
  const [backDrop, setBackDrop] = useState(false);
  const [compressionFactor, setCompressionFactor] = useState(0.8);
  const [activePanel, setActivePanel] = useState("adjust");
  
  // Adjustment values
  const [adjustments, setAdjustments] = useState({
    exposure: 0.45,
    contrast: -12,
    highlights: 0,
    shadows: 24,
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
          setImage={setImage}
        />
        <div className="main-layout">
          <LeftToolbar 
            activeTool={activeTool} 
            setActiveTool={setActiveTool}
            darkMode={darkMode}
          />
          <div className="canvas-area">
            <ImageCanvas 
              image={image}
              setImage={setImage}
              setActions={setActions}
              Actions={actions}
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
            setImage={setImage}
            setActions={setActions}
            Actions={actions}
            setBackDrop={setBackDrop}
            compressionFactor={compressionFactor}
            setCompressionFactor={setCompressionFactor}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
