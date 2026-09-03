import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.js';

// Pagina de login do painel administrativo.

export function LoginPage(): React.ReactNode {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (evento: SyntheticEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      await login(email, senha);
      await navigate('/admin');
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao fazer login.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-teal-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-teal-800">Painel Administrativo</h1>

        {erro && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700" role="alert">
            {erro}
          </div>
        )}

        <form
          onSubmit={(evento) => {
            void handleSubmit(evento);
          }}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => {
                setEmail(evento.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
              disabled={carregando}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(evento) => {
                setSenha(evento.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
              disabled={carregando}
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
