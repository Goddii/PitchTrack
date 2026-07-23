import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Teams from './pages/Teams'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teams" element={<Teams />} />
                
            </Routes>
        </BrowserRouter>

    )
  
}

export default App
