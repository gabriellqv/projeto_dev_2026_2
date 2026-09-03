import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.js';

// Cabecalho administrativo com navegacao e botao de logout.

export function AdminHeader(): React.ReactNode {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    void navigate('/admin/login');
  };

  return (
    <header className="bg-teal-800 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-lg font-bold hover:text-teal-200">
            OdontoAgenda Admin
          </Link>
          <nav className="hidden gap-4 text-sm md:flex">
            <Link to="/admin" className="hover:text-teal-200">
              Agendamentos
            </Link>
            <Link to="/admin/procedimentos" className="hover:text-teal-200">
              Procedimentos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {usuario && <span className="hidden md:inline">{usuario.email}</span>}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-white px-3 py-1 hover:bg-white hover:text-teal-800"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
