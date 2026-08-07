import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { isSeeded } from '@/services/storage.service';
import { seedDatabase } from '@/services/seed.service';
import '@/styles/globals.css';

// Seed database on first load
if (!isSeeded()) seedDatabase();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          fontSize: '14px',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: 'white' } },
      }}
    />
  </StrictMode>,
);
