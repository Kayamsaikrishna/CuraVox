import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { VoiceFeedbackProvider } from './contexts/VoiceFeedbackContext';
import { AppDataProvider } from './contexts/AppDataContext';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <VoiceFeedbackProvider>
          <AppDataProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppDataProvider>
        </VoiceFeedbackProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </React.StrictMode>,
);