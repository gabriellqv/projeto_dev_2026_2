import { Router } from 'express';
import { z } from 'zod';

import { autenticar, exigirAdmin } from '../../../shared/middlewares/auth.middleware.js';
import {
  validarParams,
  validarSchema,
  validarQuery,
} from '../../../shared/middlewares/validate.middleware.js';
import {
  atualizarStatusAgendamentoSchema,
  listarAgendamentosSchema,
} from '../../../shared/schemas/agendamento.schema.js';
import { AgendamentoAdminController } from '../controllers/agendamento-admin.controller.js';
import { criarAgendamentoService } from '../factories/agendamento.factory.js';

// Rotas administrativas de agendamentos.
// Requerem autenticacao e perfil de administrador.

const agendamentoService = criarAgendamentoService();
const controller = new AgendamentoAdminController(agendamentoService);

export const agendamentoAdminRouter = Router();

const paramsIdSchema = z.object({ id: z.string().uuid() });

agendamentoAdminRouter.get(
  '/',
  autenticar(),
  exigirAdmin,
  validarQuery(listarAgendamentosSchema),
  controller.listar,
);
agendamentoAdminRouter.patch(
  '/:id/status',
  autenticar(),
  exigirAdmin,
  validarParams(paramsIdSchema),
  validarSchema(atualizarStatusAgendamentoSchema),
  controller.atualizarStatus,
);
