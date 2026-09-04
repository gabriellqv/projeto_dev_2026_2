import type { Request, RequestHandler, Response } from 'express';

import { toAgendamentoDetalheDto, toAgendamentoDto } from '../../../shared/dtos/agendamento.dto.js';
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

    response.json({
      agendamentos: resultado.agendamentos.map(toAgendamentoDto),
      total: resultado.total,
    });
  };

  contarPorStatus: RequestHandler = async (
    _request: Request,
    response: Response,
  ): Promise<void> => {
    const contagem = await this.agendamentoService.contarPorStatus();

    response.json(contagem);
  };

  buscarPorId: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const agendamento = await this.agendamentoService.buscarPorId(String(request.params.id));

    response.json(toAgendamentoDetalheDto(agendamento));
  };

  atualizarStatus: RequestHandler = async (request: Request, response: Response): Promise<void> => {
    const agendamento = await this.agendamentoService.atualizarStatus(
      String(request.params.id),
      request.body,
    );

    response.json(toAgendamentoDto(agendamento));
  };
}
