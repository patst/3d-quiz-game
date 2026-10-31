import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { speech } from './audio/speech';
import './styles.css';

// Load the clip manifest early and register the iOS audio unlock on the first tap.
speech();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
