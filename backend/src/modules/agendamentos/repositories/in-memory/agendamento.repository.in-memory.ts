import type { Agendamento, StatusAgendamento } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import type { AgendamentoData, AgendamentoRepository } from '../../agendamento.repository.js';

// Repositorio in-memory para testes unitarios de agendamentos.
// Simula o banco em memoria RAM sem tocar no PostgreSQL.

export class InMemoryAgendamentoRepository implements AgendamentoRepository {
  private agendamentos: Agendamento[] = [];

  async listar(params: {
    status?: StatusAgendamento;
    busca?: string;
    pagina: number;
    limite: number;
  }): Promise<Agendamento[]> {
    let resultado = this.agendamentos;

    if (params.status) {
      resultado = resultado.filter((a) => a.status === params.status);
    }

    if (params.busca) {
      const termo = params.busca.toLowerCase();
      resultado = resultado.filter(
        (a) => a.nome.toLowerCase().includes(termo) || a.email.toLowerCase().includes(termo),
      );
    }

    const skip = (params.pagina - 1) * params.limite;

    return resultado.slice(skip, skip + params.limite);
  }

  async contar(params: { status?: StatusAgendamento; busca?: string }): Promise<number> {
    let resultado = this.agendamentos;

    if (params.status) {
      resultado = resultado.filter((a) => a.status === params.status);
    }

    if (params.busca) {
      const termo = params.busca.toLowerCase();
      resultado = resultado.filter(
        (a) => a.nome.toLowerCase().includes(termo) || a.email.toLowerCase().includes(termo),
      );
    }

    return resultado.length;
  }

  async buscarPorId(id: string): Promise<Agendamento | null> {
    return this.agendamentos.find((a) => a.id === id) ?? null;
  }

  async existeAgendamento(email: string, data: Date, horario: string): Promise<boolean> {
    return this.agendamentos.some(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() &&
        a.data.getTime() === data.getTime() &&
        a.horario === horario,
    );
  }

  async criar(dados: AgendamentoData): Promise<Agendamento> {
    const agendamento: Agendamento = {
      ...dados,
      id: uuid(),
      status: 'PENDENTE',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    this.agendamentos.push(agendamento);

    return agendamento;
  }

  async atualizarStatus(id: string, status: StatusAgendamento): Promise<Agendamento> {
    const indice = this.agendamentos.findIndex((a) => a.id === id);

    if (indice === -1) {
      throw new Error(`Agendamento nao encontrado: ${id}`);
    }

    this.agendamentos[indice] = {
      ...this.agendamentos[indice],
      status,
      atualizadoEm: new Date(),
    };

    return this.agendamentos[indice];
  }
}
