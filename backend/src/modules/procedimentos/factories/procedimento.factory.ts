import { PrismaProcedimentoRepository } from '../procedimento.repository.prisma.js';
import { ProcedimentoService } from '../services/procedimento.service.js';

// Factory conecta a implementacao Prisma ao service.
// Ponto unico de criacao para uso em controllers e testes de integracao.

export function criarProcedimentoService(): ProcedimentoService {
  const repository = new PrismaProcedimentoRepository();

  return new ProcedimentoService(repository);
}
