import type { Request, RequestHandler, Response } from 'express';

import { DomainError } from '../../../shared/errors/domain-error.js';
import type { ProcedimentoService } from '../services/procedimento.service.js';

// Controller publico de procedimentos.
// Expor apenas a listagem de procedimentos ativos para a pagina publica.

export class ProcedimentoPublicController {
  constructor(private readonly procedimentoService: ProcedimentoService) {}

  listarAtivos: RequestHandler = async (_request: Request, response: Response): Promise<void> => {
    try {
      const procedimentos = await this.procedimentoService.listarAtivos();

      response.json(procedimentos);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };
}
