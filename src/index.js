import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Global Axios interceptor to dynamically rewrite the production API URL to the local backend URL in development
axios.interceptors.request.use(
  (config) => {
    const targetBaseUrl = process.env.REACT_APP_API_URL || 'https://admin-aged-field-2794.fly.dev';
    if (config.baseURL && config.baseURL.includes('admin-aged-field-2794.fly.dev')) {
      config.baseURL = config.baseURL.replace('https://admin-aged-field-2794.fly.dev', targetBaseUrl);
    }
    if (config.url && config.url.includes('admin-aged-field-2794.fly.dev')) {
      config.url = config.url.replace('https://admin-aged-field-2794.fly.dev', targetBaseUrl);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

