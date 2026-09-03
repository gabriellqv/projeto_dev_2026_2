import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage.js';
import { ConfirmationPage } from './pages/ConfirmationPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ProceduresPage } from './pages/ProceduresPage.js';

/**
 * Componente raiz da aplicacao.
 * Define as rotas publicas e administrativas do sistema.
 */
export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/confirmacao" element={<ConfirmationPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/agendamentos/:id" element={<AppointmentDetailPage />} />
          <Route path="/admin/procedimentos" element={<ProceduresPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
