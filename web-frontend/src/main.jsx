import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Error Handler to prevent white screens
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Fatal crash:', message, error);
  // Show a user-friendly alert if the app crashes during boot
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
            <div style="padding: 2rem; text-align: center; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; background: #f8fafc;">
                <h1 style="color: #ef4444; margin-bottom: 1rem;">Oops! Something went wrong</h1>
                <p style="color: #64748b; margin-bottom: 2rem;">The application failed to load. This might be due to a connection error or a missing configuration.</p>
                <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; text-align: left;">
                    <code style="font-size: 0.875rem; color: #ef4444;">${message}</code>
                </div>
                <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">
                    Reload Application
                </button>
            </div>
        `;
  }
  return false;
};

window.onunhandledrejection = function (event) {
  console.error('Unhandled promise rejection:', event.reason);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
