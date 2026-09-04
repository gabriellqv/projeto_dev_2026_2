import type { Request, RequestHandler, Response } from 'express';

import type { AuthService } from '../services/auth.service.js';

// Controller público de autenticação.
// Recebe email e senha, delega a validação para o AuthService e define o cookie httpOnly.
// Permite recuperar a sessão ativa e realizar logout com limpeza de cookies.

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const { usuario, token } = await this.authService.login(request.body);

    response
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        usuario: this.serializarUsuario(usuario),
        token,
      });
  };

  me: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const cookieToken = request.cookies.token as string | undefined;
    const authHeader = request.headers.authorization;

    let token: string | undefined;

    if (cookieToken) {
      token = cookieToken;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      response.status(401).json({ message: 'Token de autenticacao nao informado' });

      return;
    }

    const usuario = await this.authService.obterUsuarioPorToken(token);

    response.json({
      usuario: this.serializarUsuario(usuario),
    });
  };

  logout: RequestHandler = async (_request: Request, response: Response): Promise<void> => {
    response
      .clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json({ message: 'Logout realizado com sucesso' });
  };

  private serializarUsuario(usuario: { id: string; email: string; nome: string; admin: boolean }): {
    id: string;
    email: string;
    nome: string;
    admin: boolean;
  } {
    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      admin: usuario.admin,
    };
  }
}
