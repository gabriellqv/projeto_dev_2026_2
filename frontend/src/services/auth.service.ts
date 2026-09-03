import { api } from './api.js';

// Servico de autenticacao do painel administrativo.
// Armazena o token JWT no localStorage para persistencia entre recarregamentos.

const STORAGE_KEY = 'odontoagenda_token';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  admin: boolean;
}

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export const authService = {
  async login(dados: LoginInput): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', dados);
    localStorage.setItem(STORAGE_KEY, response.data.token);
    return response.data;
  },

  async me(): Promise<Usuario> {
    const response = await api.get<{ usuario: Usuario }>('/auth/me');
    return response.data.usuario;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};

export function setAuthHeader(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
