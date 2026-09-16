import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { CacheProvider } from './context/CacheContext';
import AboutPage from './routes/AboutPage';
import SettingsPage from './routes/SettingsPage';
import ContentPage from './routes/ContentPage';
import VideosPage from './routes/VideosPage';
import LessonsPage from './routes/LessonsPage';
import LessonPage from './routes/LessonPage';
import CampaignsPage from './routes/CampaignsPage';
import AutomationsPage from './routes/AutomationsPage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <NavLink to="/about" className="App-brand">
          <img src="/clutcher-sq-192.png" alt="" width="32" height="32" />
          <span>Clutcher</span>
        </NavLink>
        <nav className="App-nav" aria-label="Primary">
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            About
          </NavLink>
          <NavLink to="/content" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end={false}>
            Content
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Settings
          </NavLink>
        </nav>
      </header>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/content" element={<ContentPage />}>
            <Route index element={<Navigate to="lessons" replace />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="lessons/:lessonId" element={<LessonPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="automations" element={<AutomationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/about" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <AuthProvider>
        <CacheProvider>
          <App />
        </CacheProvider>
      </AuthProvider>
    </Router>
  );
}
