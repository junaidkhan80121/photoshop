import "./App.css";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { useCallback, useState } from "react";
import NavBar from "./Navbar";
import ImageCropper from "./Cropper";

function App() {
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
      <NavBar darkMode={darkMode} setdarkMode={setdarkMode} />
      <ImageCropper darkMode={darkMode} />
    </ThemeProvider>
    </>
  );
}

export default App;
