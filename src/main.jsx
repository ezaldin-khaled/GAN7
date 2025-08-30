import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css'
import './i18n'; // Import i18n configuration
import { LanguageProvider } from './context/LanguageContext';


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