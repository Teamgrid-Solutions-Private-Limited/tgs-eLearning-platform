import { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Box } from '@mui/material'

function App() {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Navbar />
      <Home />
    </Box>
  )
}

export default App
