import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css'
import './i18n'; // Import i18n configuration
import { LanguageProvider } from './context/LanguageContext';
import { initializeCSRFToken } from './api/axios';

// Remove loading state to prevent flash of unstyled content
document.documentElement.classList.add('loading-ready');

// Initialize CSRF token for Django backend
initializeCSRFToken();

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider>
    <Router>
      <App />
    </Router>
    </LanguageProvider>
  </React.StrictMode>
);