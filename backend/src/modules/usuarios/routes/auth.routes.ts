import { Router } from 'express';

import { asyncHandler } from '../../../shared/utils/async-handler.js';
import { criarAuthController } from '../factories/auth.factory.js';

// Rotas publicas de autenticacao.
// O controller gerencia o login de administradores.

const authController = criarAuthController();

export const authRouter = Router();

authRouter.post('/login', asyncHandler(authController.login));
