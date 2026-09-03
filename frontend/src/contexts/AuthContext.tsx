import { createContext, useContext, useEffect, useState } from 'react';

import { authService, setAuthHeader, type Usuario } from '../services/auth.service.js';

// Contexto de autenticacao para compartilhar sessao entre as paginas administrativas.

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactNode {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = authService.getToken();

    if (token) {
      setAuthHeader(token);
      authService
        .me()
        .then((dados) => {
          setUsuario(dados);
        })
        .catch(() => {
          authService.logout();
          setAuthHeader(null);
        })
        .finally(() => {
          setCarregando(false);
        });
    } else {
      setCarregando(false);
    }
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    const { token, usuario: dadosUsuario } = await authService.login({ email, senha });
    setAuthHeader(token);
    setUsuario(dadosUsuario);
  };

  const logout = (): void => {
    authService.logout();
    setAuthHeader(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return contexto;
}
