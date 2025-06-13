
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// For the demo, we import the library's source CSS.
// A consuming application would import from '@bikiran/chronopick/dist/style.css'
import './src/style.css'; 

/**
 * Main entry point for the ChronoPick DEMO React application.
 * It finds the root DOM element and renders the App component into it.
 */

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to for the demo");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
