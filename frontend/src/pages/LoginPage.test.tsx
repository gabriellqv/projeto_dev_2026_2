import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { authService } from '../services/auth.service';

import { LoginPage } from './LoginPage';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.me).mockRejectedValue(new Error('Não autenticado'));
  });

  it('deve renderizar os campos de email e senha e o botão de acesso', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/E-mail de Acesso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acessar Painel/i })).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando o login falha', async () => {
    const loginSpy = vi.spyOn(authService, 'login');
    loginSpy.mockRejectedValue(new Error('Credenciais inválidas.'));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/E-mail de Acesso/i), {
      target: { value: 'admin@clinica.com' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: 'senha-errada' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Acessar Painel/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas.')).toBeInTheDocument();
    });
  });

  it('deve chamar o authService.login com as credenciais corretas', async () => {
    const loginSpy = vi.spyOn(authService, 'login');
    loginSpy.mockResolvedValue({
      id: 'user-1',
      email: 'admin@sorrisomineiro.com.br',
      nome: 'Administrador',
      admin: true,
    });

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/E-mail de Acesso/i), {
      target: { value: 'admin@sorrisomineiro.com.br' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: 'admin123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Acessar Painel/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'admin@sorrisomineiro.com.br',
        senha: 'admin123',
      });
    });
  });
});
