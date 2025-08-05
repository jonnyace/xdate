import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// PWA Service Worker registration
import { registerSW } from './serviceWorker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
registerSW();