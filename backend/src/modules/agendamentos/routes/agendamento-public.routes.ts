import { Router } from 'express';

import { validarSchema } from '../../../shared/middlewares/validate.middleware.js';
import { criarAgendamentoSchema } from '../../../shared/schemas/agendamento.schema.js';
import { AgendamentoPublicController } from '../controllers/agendamento-public.controller.js';
import { criarAgendamentoService } from '../factories/agendamento.factory.js';

// Rotas publicas de agendamentos.
// Permite que visitantes criem agendamentos sem autenticacao.

const agendamentoService = criarAgendamentoService();
const controller = new AgendamentoPublicController(agendamentoService);

export const agendamentoPublicRouter = Router();

agendamentoPublicRouter.post('/', validarSchema(criarAgendamentoSchema), controller.criar);
