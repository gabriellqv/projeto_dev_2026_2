import { PrismaProcedimentoRepository } from '../../procedimentos/procedimento.repository.prisma.js';
import { PrismaAgendamentoRepository } from '../agendamento.repository.prisma.js';
import { AgendamentoService } from '../services/agendamento.service.js';

// Factory conecta as implementacoes Prisma ao service de agendamentos.
// Ponto unico de criacao para uso em controllers e testes de integracao.

export function criarAgendamentoService(): AgendamentoService {
  const agendamentoRepository = new PrismaAgendamentoRepository();
  const procedimentoRepository = new PrismaProcedimentoRepository();

  return new AgendamentoService(agendamentoRepository, procedimentoRepository);
}
