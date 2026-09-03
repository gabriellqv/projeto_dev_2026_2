import { Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { ConfirmationPage } from './pages/ConfirmationPage.js';
import { HomePage } from './pages/HomePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

/**
 * Componente raiz da aplicação.
 * Define as rotas públicas da landing page com suporte a Temas, Toasts e ErrorBoundary.
 */
export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/confirmacao" element={<ConfirmationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
