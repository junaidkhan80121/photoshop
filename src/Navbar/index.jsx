import { React, useCallback } from 'react'
import { AppBar, Toolbar, Switch, Typography, List, ListItem, ListItemText } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import './navbar.css';


export default function NavBar({ darkMode, setdarkMode }) {

  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setdarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString()); // Store as string
    console.log('Current Mode', newMode);
  }, [darkMode, setdarkMode]);


  return (
    <AppBar position="static">
      <Toolbar>
        <Typography><b>Sub-Zero</b></Typography>
        <List className='navbar-links' sx={{ display: "flex", marginLeft: "auto" }}>
          <ListItem className=''>Home</ListItem>
          <ListItem className=''>About&nbsp;Us</ListItem>
          <ListItem className=''>Contact</ListItem>
        </List>

        <Switch size='large' color='default' checked={darkMode ? true : false} onChange={() => { toggleDarkMode() }} sx={{ marginLeft: 'auto' }} />
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}

      </Toolbar>
    </AppBar>
  )
}
