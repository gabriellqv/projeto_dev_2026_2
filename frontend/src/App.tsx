import { Route, Routes } from 'react-router-dom';

import { ConfirmationPage } from './pages/ConfirmationPage.js';
import { HomePage } from './pages/HomePage.js';

/**
 * Componente raiz da aplicacao.
 * Define as rotas publicas da pagina inicial e confirmacao.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/confirmacao" element={<ConfirmationPage />} />
    </Routes>
  );
}
