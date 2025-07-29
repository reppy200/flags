import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { setupMockApi } from './api/mockServer';
import './styles/main.css';

// Initialize mock API for development
setupMockApi();

// Performance monitoring
const startTime = performance.now();

// Remove loading spinner when app is ready
const removeLoadingSpinner = () => {
  const loadingContainer = document.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.remove();
  }
};

// Initialize app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App onReady={() => {
      removeLoadingSpinner();
      const loadTime = performance.now() - startTime;
      console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
    }} />
  </StrictMode>
);

// Register service worker for PWA capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}