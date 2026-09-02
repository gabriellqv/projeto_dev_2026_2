import type { Request, RequestHandler, Response } from 'express';

import { DomainError } from '../../../shared/errors/domain-error.js';
import type { AgendamentoService } from '../services/agendamento.service.js';

// Controller administrativo de agendamentos.
// Responsavel por listar e atualizar o status dos agendamentos no painel.

export class AgendamentoAdminController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  listar: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
      const resultado = await this.agendamentoService.listar({
        status: request.query.status as unknown as undefined,
        busca: request.query.busca as unknown as undefined,
        pagina: Number(request.query.pagina) || 1,
        limite: Number(request.query.limite) || 10,
      });

      response.json(resultado);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };

  atualizarStatus: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    try {
      const agendamento = await this.agendamentoService.atualizarStatus(
        String(request.params.id),
        request.body,
      );

      response.json(agendamento);
    } catch (error) {
      if (error instanceof DomainError) {
        response.status(400).json({ message: error.message });

        return;
      }

      response.status(500).json({ message: 'Erro interno no servidor' });
    }
  };
}
