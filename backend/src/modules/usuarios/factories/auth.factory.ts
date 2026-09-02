import { AuthController } from '../controllers/auth.controller.js';
import { AuthService, type AuthConfig } from '../services/auth.service.js';
import { PrismaUsuarioRepository } from '../usuario.repository.prisma.js';

// Factory centraliza a criacao do controller de autenticacao.
// Mantem a rota livre de logica de composicao de dependencias.
// Carrega configuracao JWT do ambiente, com valores padrao seguros para desenvolvimento.

export function criarAuthController(): AuthController {
  const usuarioRepository = new PrismaUsuarioRepository();
  const authConfig = {
    secret: process.env.JWT_SECRET ?? 'chave-padrao-apenas-para-desenvolvimento',
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '24h') as AuthConfig['expiresIn'],
  };
  const authService = new AuthService(usuarioRepository, authConfig);

  return new AuthController(authService);
}
