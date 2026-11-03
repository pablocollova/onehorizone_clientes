import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n.js'

async function start() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const { installDemo } = await import('./demo/api');
    installDemo();
  }
  createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
}
start();
