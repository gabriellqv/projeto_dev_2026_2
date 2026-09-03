import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';

// Payload esperado no token JWT.

export interface AuthRequest extends Request {
  usuario?: {
    id: string;
    email: string;
    admin: boolean;
  };
}

// Middleware de autenticacao JWT.
// Protege rotas administrativas verificando o header Authorization.

export function autenticar(): RequestHandler {
  return (request: AuthRequest, response: Response, next: NextFunction): void => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).json({ message: 'Token de autenticacao nao informado' });

      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      response.status(500).json({ message: 'JWT_SECRET nao configurado' });

      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as { id: string; email: string; admin: boolean };

      request.usuario = decoded;
      next();
    } catch {
      response.status(401).json({ message: 'Token invalido ou expirado' });

      return;
    }
  };
}

// Middleware que exige usuario autenticado na request.
// Deve ser usado apos o middleware de autenticacao.

export function exigirAdmin(request: AuthRequest, response: Response, next: NextFunction): void {
  if (!request.usuario?.admin) {
    response.status(403).json({ message: 'Acesso restrito a administradores' });

    return;
  }

  next();
}
