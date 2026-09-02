import { Router } from 'express';

import { ProcedimentoPublicController } from '../controllers/procedimento-public.controller.js';
import { criarProcedimentoService } from '../factories/procedimento.factory.js';

// Rotas publicas de procedimentos.
// Apenas a listagem de procedimentos ativos e disponivel sem autenticacao.

const procedimentoService = criarProcedimentoService();
const controller = new ProcedimentoPublicController(procedimentoService);

export const procedimentoPublicRouter = Router();

procedimentoPublicRouter.get('/', controller.listarAtivos);
