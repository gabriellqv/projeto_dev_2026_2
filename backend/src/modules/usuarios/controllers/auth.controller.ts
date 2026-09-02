import type { Request, RequestHandler, Response } from 'express';

import type { AuthService } from '../services/auth.service.js';

// Controller publico de autenticacao.
// Recebe email e senha, delega a validacao para o AuthService e retorna o token JWT.
// Erros de dominio sao tratados pelo middleware global de erros.

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const { usuario, token } = await this.authService.login(request.body);

    response.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        admin: usuario.admin,
      },
      token,
    });
  };
}
