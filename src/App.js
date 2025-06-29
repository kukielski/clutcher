import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import logo from './socrateasy.png';
import AboutPage from './routes/AboutPage';
import ContentPage from './routes/ContentPage';
import VideosPage from './routes/VideosPage';
import LessonsPage from './routes/LessonsPage';
import LessonPage from './routes/LessonPage';
import CampaignsPage from './routes/CampaignsPage';
import AutomationsPage from './routes/AutomationsPage';

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

  // Helper to check if a route is active (works for subroutes)
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Hide nav on mobile unless menuOpen is true
  const navClass = menuOpen ? "App-nav open" : "App-nav";

  return (
    <div className="App">
      <header className="App-header">
        <nav className={navClass}>
          <ul>
            <li>
              <Link
                to="/about"
                className={isActive('/about') ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/content"
                className={isActive('/content') ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                Content
              </Link>
            </li>
          </ul>
        </nav>
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
        <Route path="/" element={<Navigate to="/about" />} /> {/* Default to About */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/content" element={<ContentPage />}>
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:lessonId" element={<LessonPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="automations" element={<AutomationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/about" />} />
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
