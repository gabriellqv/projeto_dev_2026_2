import type { Request, RequestHandler, Response } from 'express';

import { DomainError } from '../../../shared/errors/domain-error.js';
import type { ProcedimentoService } from '../services/procedimento.service.js';

// Controller administrativo de procedimentos.
// Permite criar, listar e atualizar procedimentos no painel de gestao.

export class ProcedimentoAdminController {
  constructor(private readonly procedimentoService: ProcedimentoService) {}

  listarTodos: RequestHandler = async (_request: Request, response: Response): Promise<void> => {
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

  criar: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
      const procedimento = await this.procedimentoService.criar(request.body);

      response.status(201).json(procedimento);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };

  atualizar: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
      const procedimento = await this.procedimentoService.atualizar(String(request.params.id), request.body);

      response.json(procedimento);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };

  desativar: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
      const procedimento = await this.procedimentoService.desativar(String(request.params.id));

      response.json(procedimento);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };
}
