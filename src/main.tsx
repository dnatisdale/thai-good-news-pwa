import './lib/blankGuard';                 // 👈 first: install global error overlay
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { setupSWUpdate } from './sw-update';
import { AuthProvider } from '@/hooks/useAuth';
import ErrorBoundary from '@/components/ErrorBoundary';
import { I18nProvider } from '@/lib/i18n'; 


setupSWUpdate();

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e: any) {
  console.error('Fatal render error:', e);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding:24px;max-width:720px;margin:40px auto;font-family:system-ui">
        <h1>Something went wrong</h1>
        <pre style="white-space:pre-wrap;background:#f3f4f6;padding:12px;border-radius:8px">${String(e?.message || e)}</pre>
        <p>Open the browser console for details.</p>
      </div>`;
  }
}
