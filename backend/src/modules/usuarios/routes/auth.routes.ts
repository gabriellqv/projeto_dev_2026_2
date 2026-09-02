import { Router } from 'express';

import { authLimiter } from '../../../shared/middlewares/rate-limit.middleware.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
import { criarAuthController } from '../factories/auth.factory.js';

// Rotas publicas de autenticacao.
// O controller gerencia o login de administradores.

const authController = criarAuthController();

export const authRouter = Router();

authRouter.post('/login', authLimiter, asyncHandler(authController.login));
