import React from 'react';
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

  // Helper to check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="App">
      <header className="App-header">
        <nav className="App-nav">
          <ul>
            <li>
              <Link to="/">
                <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="logo" className="App-nav-logo" />
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={isActive('/products') ? 'nav-link active' : 'nav-link'}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/videos"
                className={isActive('/videos') ? 'nav-link active' : 'nav-link'}
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={isActive('/about') ? 'nav-link active' : 'nav-link'}
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
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
