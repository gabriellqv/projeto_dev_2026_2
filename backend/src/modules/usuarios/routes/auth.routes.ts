import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { PrismaUsuarioRepository } from '../usuario.repository.prisma.js';

// Rotas publicas de autenticacao.
// O controller gerencia o login de administradores.

const usuarioRepository = new PrismaUsuarioRepository();
const authService = new AuthService(usuarioRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post('/login', authController.login);
