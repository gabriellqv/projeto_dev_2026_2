import type { Request, RequestHandler, Response } from 'express';

import { DomainError } from '../../../shared/errors/domain-error.js';
import type { AuthService } from '../services/auth.service.js';

// Controller publico de autenticacao.
// Recebe email e senha, delega a validacao para o AuthService e retorna o token JWT.

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
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
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(401).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };
}
