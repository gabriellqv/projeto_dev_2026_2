import { Router } from 'express';
import { z } from 'zod';

import { autenticar, exigirAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validarParams, validarSchema } from '../../../shared/middlewares/validate.middleware.js';
import {
  criarProcedimentoSchema,
  atualizarProcedimentoSchema,
} from '../../../shared/schemas/procedimento.schema.js';
import { ProcedimentoAdminController } from '../controllers/procedimento-admin.controller.js';
import { criarProcedimentoService } from '../factories/procedimento.factory.js';

// Rotas administrativas de procedimentos.
// Requerem autenticacao e perfil de administrador.

const procedimentoService = criarProcedimentoService();
const controller = new ProcedimentoAdminController(procedimentoService);

export const procedimentoAdminRouter = Router();

const paramsIdSchema = z.object({ id: z.string().uuid() });

procedimentoAdminRouter.get('/', autenticar(), exigirAdmin, controller.listarTodos);
procedimentoAdminRouter.post(
  '/',
  autenticar(),
  exigirAdmin,
  validarSchema(criarProcedimentoSchema),
  controller.criar,
);
procedimentoAdminRouter.patch(
  '/:id',
  autenticar(),
  exigirAdmin,
  validarParams(paramsIdSchema),
  validarSchema(atualizarProcedimentoSchema),
  controller.atualizar,
);
procedimentoAdminRouter.delete(
  '/:id',
  autenticar(),
  exigirAdmin,
  validarParams(paramsIdSchema),
  controller.desativar,
);
