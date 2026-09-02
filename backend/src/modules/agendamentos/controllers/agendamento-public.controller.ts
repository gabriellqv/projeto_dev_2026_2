import type { Request, RequestHandler, Response } from 'express';

import { DomainError } from '../../../shared/errors/domain-error.js';
import type { AgendamentoService } from '../services/agendamento.service.js';

// Controller publico de agendamentos.
// Responsavel por receber os dados do formulario e criar um agendamento pendente.

export class AgendamentoPublicController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  criar: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
      const agendamento = await this.agendamentoService.criar(request.body);

      response.status(201).json(agendamento);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };
}
