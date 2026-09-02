import type { Request, RequestHandler, Response } from 'express';

import type { AgendamentoService } from '../services/agendamento.service.js';

// Controller administrativo de agendamentos.
// Responsavel por listar, detalhar e atualizar o status dos agendamentos no painel.
// Erros de dominio sao tratados pelo middleware global de erros.

export class AgendamentoAdminController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  listar: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const resultado = await this.agendamentoService.listar({
      status: request.query.status as unknown as undefined,
      busca: request.query.busca as unknown as undefined,
      pagina: Number(request.query.pagina) || 1,
      limite: Number(request.query.limite) || 10,
    });

    response.json(resultado);
  };

  buscarPorId: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const agendamento = await this.agendamentoService.buscarPorId(String(request.params.id));

    response.json(agendamento);
  };

  atualizarStatus: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const agendamento = await this.agendamentoService.atualizarStatus(
      String(request.params.id),
      request.body,
    );

    response.json(agendamento);
  };
}
