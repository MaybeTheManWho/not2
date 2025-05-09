import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CalendarProvider } from './contexts/CalendarContext';
import { AssetsProvider } from './contexts/AssetsContext';
import { WritingProvider } from './contexts/WritingContext';
import { StopwatchProvider } from './contexts/StopwatchContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <AssetsProvider>
            <WritingProvider>
              <StopwatchProvider>
                <App />
              </StopwatchProvider>
            </WritingProvider>
          </AssetsProvider>
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
