import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import NavBar from "./Navbar";
import ImageCropper from "./Cropper";

function App() {
  const [dialog, setDialog] = useState(true);
  const checkThemeMode = useCallback(() => {
    let mode = localStorage.getItem("darkMode");
    if (!mode) {
      mode = "false";
      localStorage.setItem("darkMode", mode);
    }
    return mode === "true";
  }, []);

  const [darkMode, setdarkMode] = useState(checkThemeMode());
  
  // Create modern flat theme without gradients
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#0a84ff" : "#1976d2",
        light: darkMode ? "#409cff" : "#42a5f5",
        dark: darkMode ? "#0066cc" : "#1565c0",
        contrastText: "#ffffff",
      },
      secondary: {
        main: darkMode ? "#30d158" : "#2e7d32",
        light: darkMode ? "#4cd964" : "#4caf50",
        dark: darkMode ? "#248a3d" : "#1b5e20",
        contrastText: "#ffffff",
      },
      error: {
        main: darkMode ? "#ff453a" : "#d32f2f",
      },
      warning: {
        main: darkMode ? "#ff9f0a" : "#ed6c02",
      },
      info: {
        main: darkMode ? "#64d2ff" : "#0288d1",
      },
      success: {
        main: darkMode ? "#30d158" : "#2e7d32",
      },
      background: {
        default: darkMode ? "#000000" : "#ffffff",
        paper: darkMode ? "#1c1c1e" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#f5f5f7" : "#1d1d1f",
        secondary: darkMode ? "#98989d" : "#86868b",
      },
      divider: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: {
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h5: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      body1: {
        fontWeight: 400,
        letterSpacing: "0",
      },
      body2: {
        fontWeight: 400,
        letterSpacing: "0",
      },
      button: {
        fontWeight: 500,
        textTransform: "none",
        letterSpacing: "0",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: "smooth",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transform: "translateY(-1px)",
            },
          },
          contained: {
            boxShadow: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            borderBottom: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:before": {
              display: "none",
            },
            borderBottom: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            height: 4,
          },
          thumb: {
            width: 16,
            height: 16,
            "&:hover": {
              boxShadow: "0 2px 10px rgba(25, 118, 210, 0.5)",
            },
          },
          track: {
            height: 4,
            borderRadius: 2,
          },
          rail: {
            height: 4,
            borderRadius: 2,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
          },
          switchBase: {
            padding: 0,
            margin: 2,
            transitionDuration: "200ms",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: darkMode ? "#30d158" : "#1976d2",
                opacity: 1,
                border: 0,
              },
            },
          },
          thumb: {
            boxSizing: "border-box",
            width: 22,
            height: 22,
          },
          track: {
            borderRadius: 13,
            backgroundColor: darkMode ? "#39393d" : "#ccc",
            opacity: 1,
          },
        },
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dialog
          open={dialog}
          onClose={() => {
            setDialog(false);
          }}
        >
          <DialogTitle>
            <Typography variant="h5">Please Note</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Due to hosting limitations, the app may take a little while to load for
              the first time to become available. Thanks for your patience!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setDialog(false);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <NavBar darkMode={darkMode} setdarkMode={setdarkMode} />
        <ImageCropper darkMode={darkMode} />
      </ThemeProvider>
    </>
  );
}

export default App;
