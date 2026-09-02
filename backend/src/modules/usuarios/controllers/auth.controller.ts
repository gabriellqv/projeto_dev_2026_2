import type { Request, RequestHandler, Response } from 'express';

import type { AuthService } from '../services/auth.service.js';

// Controller publico de autenticacao.
// Recebe email e senha, delega a validacao para o AuthService e retorna o token JWT.
// Tambem permite recuperar a sessao ativa a partir de um token valido.
// Erros de dominio sao tratados pelo middleware global de erros.

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const { usuario, token } = await this.authService.login(request.body);

    response.json({
      usuario: this.serializarUsuario(usuario),
      token,
    });
  };

  me: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).json({ message: 'Token de autenticacao nao informado' });

      return;
    }

    const token = authHeader.split(' ')[1];
    const usuario = await this.authService.obterUsuarioPorToken(token);

    response.json({
      usuario: this.serializarUsuario(usuario),
    });
  };

  private serializarUsuario(usuario: { id: string; email: string; nome: string; admin: boolean }) {
    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      admin: usuario.admin,
    };
  }
}
