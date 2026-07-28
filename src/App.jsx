import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Teams from './pages/Teams'
import Player from './pages/Player'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PlayerProfile from './pages/PlayerProfile'
import TeamDetails from './pages/TeamDetails'
import Matches from "./pages/Matches"


function App() {
  
    return (
        <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/players" element={<Player />} />
                <Route path="/players/:id" element={<PlayerProfile />} />
                <Route path="/teams/:id" element={<TeamDetails />} />
                <Route path="/matches" element={<Matches />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    </BrowserRouter>

    )
  
}

export default App
