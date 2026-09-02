import type { Agendamento, StatusAgendamento } from '@prisma/client';

import { DomainError } from '../../../shared/errors/domain-error.js';
import type {
  AtualizarStatusAgendamentoInput,
  CriarAgendamentoInput,
  ListarAgendamentosInput,
} from '../../../shared/schemas/agendamento.schema.js';
import type { ProcedimentoRepository } from '../../procedimentos/procedimento.repository.js';
import type { AgendamentoRepository } from '../agendamento.repository.js';

// Service centraliza a logica de negocio de agendamentos.
// Depende das interfaces dos repositorios, nao das implementacoes Prisma.

export class AgendamentoService {
  constructor(
    private readonly agendamentoRepository: AgendamentoRepository,
    private readonly procedimentoRepository: ProcedimentoRepository,
  ) {}

  async criar(input: CriarAgendamentoInput): Promise<Agendamento> {
    const procedimento = await this.procedimentoRepository.buscarPorId(input.procedimentoId);

    if (!procedimento || !procedimento.ativa) {
      throw new DomainError('Procedimento nao encontrado ou inativo');
    }

    const jaExiste = await this.verificarDuplicado(input.email, input.data, input.horario);

    if (jaExiste) {
      throw new DomainError('Ja existe um agendamento para este email no mesmo horario');
    }

    // Status inicial sempre pendente, mesmo se outro valor for enviado.
    return this.agendamentoRepository.criar({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone ?? null,
      data: input.data,
      horario: input.horario,
      observacao: input.observacao ?? null,
      procedimentoId: input.procedimentoId,
    });
  }

  async listar(
    input: ListarAgendamentosInput,
  ): Promise<{ agendamentos: Agendamento[]; total: number }> {
    const [agendamentos, total] = await Promise.all([
      this.agendamentoRepository.listar({
        status: input.status,
        busca: input.busca,
        pagina: input.pagina,
        limite: input.limite,
      }),
      this.agendamentoRepository.contar({
        status: input.status,
        busca: input.busca,
      }),
    ]);

    return { agendamentos, total };
  }

  async atualizarStatus(id: string, input: AtualizarStatusAgendamentoInput): Promise<Agendamento> {
    const agendamento = await this.agendamentoRepository.buscarPorId(id);

    if (!agendamento) {
      throw new DomainError('Agendamento nao encontrado');
    }

    // Valida transicoes permitidas entre status.
    this.validarTransicao(agendamento.status, input.status);

    return this.agendamentoRepository.atualizarStatus(id, input.status);
  }

  private async verificarDuplicado(email: string, data: Date, horario: string): Promise<boolean> {
    const existentes = await this.agendamentoRepository.listar({
      busca: email,
      pagina: 1,
      limite: 100,
    });

    return existentes.some(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() &&
        this.mesmaData(a.data, data) &&
        a.horario === horario,
    );
  }

  private validarTransicao(atual: StatusAgendamento, novo: StatusAgendamento): void {
    if (atual === novo) {
      return;
    }

    if (atual === 'CANCELADO') {
      throw new DomainError('Nao e possivel alterar o status de um agendamento cancelado');
    }

    if (atual === 'ATENDIDO') {
      throw new DomainError('Nao e possivel alterar o status de um agendamento ja atendido');
    }

    if (novo === 'ATENDIDO' && atual !== 'CONFIRMADO') {
      throw new DomainError('Somente agendamentos confirmados podem ser atendidos');
    }
  }

  private mesmaData(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }
}
