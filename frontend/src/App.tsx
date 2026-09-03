import { Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { AgendaPage } from './pages/AgendaPage.js';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage.js';
import { ConfirmationPage } from './pages/ConfirmationPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { PatientsPage } from './pages/PatientsPage.js';
import { ProceduresPage } from './pages/ProceduresPage.js';

/**
 * Componente raiz da aplicação.
 * Define as rotas públicas e administrativas do sistema com suporte a Autenticação, Temas, Toasts e ErrorBoundary.
 */
export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/confirmacao" element={<ConfirmationPage />} />
              <Route path="/admin/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/agenda" element={<AgendaPage />} />
                <Route path="/admin/pacientes" element={<PatientsPage />} />
                <Route path="/admin/agendamentos/:id" element={<AppointmentDetailPage />} />
                <Route path="/admin/procedimentos" element={<ProceduresPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
