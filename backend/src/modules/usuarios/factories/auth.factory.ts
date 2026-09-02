import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { PrismaUsuarioRepository } from '../usuario.repository.prisma.js';

// Factory centraliza a criacao do controller de autenticacao.
// Mantem a rota livre de logica de composicao de dependencias.

export function criarAuthController(): AuthController {
  const usuarioRepository = new PrismaUsuarioRepository();
  const authService = new AuthService(usuarioRepository);

  return new AuthController(authService);
}
