import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AuthGate } from './components/AuthGate';
import { App } from './App';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthGate>
  </React.StrictMode>,
);
