// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistCanvas from './pages/ArtistCanvas';
import Artists from './pages/Artists';

function App() {
  const { darkMode } = React.useContext(ThemeContext);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/artist-dashboard" element={<ArtistDashboard />} />
        <Route path="/artist-canvas" element={<ArtistCanvas />} />
        <Route path="/artist-canvas/:artistAddress" element={<ArtistCanvas />} />
        <Route path="/artists" element={<Artists />} />
      </Routes>
    </Router>
  );
}

export default function WrappedApp() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  );
}
