import "./App.css";
import { ThemeProvider } from "@emotion/react";
import {
  Button,
  createTheme,
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
  const theme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
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
