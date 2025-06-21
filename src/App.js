import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import logo from './SweetVanilla_alpha.PNG';
import AboutPage from './routes/AboutPage';
import ProductsPage from './routes/ProductsPage';
import VideosPage from './routes/VideosPage';

function AppHomeContent() {
  return (
    <div className="App-home-content">
      <img className="App-logo" src={logo} alt="logo" />
      <h1 className='standout'>Coming Soon!</h1>
    </div>
  );
}

function App() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to check if a route is active
  const isActive = (path) => location.pathname === path;

  // Hide nav on mobile unless menuOpen is true
  const navClass = menuOpen ? "App-nav open" : "App-nav";

  return (
    <div className="App">
      <header className="App-header">
        <nav className={navClass}>
          <ul>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="logo" className="App-nav-logo" />
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={isActive('/products') ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/videos"
                className={isActive('/videos') ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={isActive('/about') ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
        {/* Hamburger icon for mobile */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      {location.pathname === '/' && <AppHomeContent />}
      <Routes>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/videos" element={<VideosPage />} />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
