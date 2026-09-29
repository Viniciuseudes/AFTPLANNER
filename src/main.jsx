import './storage-shim.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AFTPlanner from './AFTPlanner.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AFTPlanner />
  </React.StrictMode>
);
