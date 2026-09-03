import { prisma } from '../../../shared/database/prisma.js';

// Service de verificacao de saude da aplicacao.
// Verifica se a conexao com o PostgreSQL esta funcionando antes de responder.

export class HealthService {
  async verificar(): Promise<{ status: string; database: string }> {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return { status: 'ok', database: 'connected' };
    } catch {
      return { status: 'error', database: 'disconnected' };
    }
  }
}
