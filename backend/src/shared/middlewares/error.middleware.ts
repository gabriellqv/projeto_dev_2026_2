import type { NextFunction, Request, Response } from 'express';

import { DomainError } from '../errors/domain-error.js';

// Middleware central de tratamento de erros.
// Converte DomainError em 400 e erros inesperados em 500.
// Garante respostas consistentes em todas as rotas.

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof DomainError) {
    response.status(400).json({ message: error.message });

    return;
  }

  // eslint-disable-next-line no-console
  console.error('Erro interno:', error);

  response.status(500).json({ message: 'Erro interno no servidor' });
}
