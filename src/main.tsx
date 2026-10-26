import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against DOM resource load events (e.g. img 404s) triggering unhandled error crashes
window.addEventListener('error', (event) => {
  // If target is an HTML element (like <img> or <link>), it is a resource load failure, not a JS crash
  if (event.target && event.target !== window && (event.target as HTMLElement).tagName) {
    event.stopPropagation();
    return;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  // If the rejection reason is not an Error or is a DOM event, suppress raw event crash
  if (event.reason instanceof Event || (event.reason && typeof event.reason === 'object' && 'isTrusted' in event.reason)) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
