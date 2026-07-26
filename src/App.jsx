import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Teams from './pages/Teams'
import Player from './pages/Player'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PlayerProfile from './pages/PlayerProfile'
import TeamDetails from './pages/TeamDetails'


function App() {
  
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/players" element={<Player />} />
                <Route path="/players/:id" element={<PlayerProfile />} />
                <Route path="/teams/:id" element={<TeamDetails />} />
                
            </Routes>
        </BrowserRouter>

    )
  
}

export default App
