import type { Agendamento, Prisma, StatusAgendamento } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.js';

import type { AgendamentoRepository } from './agendamento.repository.js';

// Implementacao do repositorio de agendamentos com Prisma.
// Filtros de busca e paginacao ficam centralizados aqui.

export class PrismaAgendamentoRepository implements AgendamentoRepository {
  async listar(params: {
    status?: StatusAgendamento;
    busca?: string;
    pagina: number;
    limite: number;
  }): Promise<Agendamento[]> {
    const skip = (params.pagina - 1) * params.limite;

    return prisma.agendamento.findMany({
      where: this.montarWhere(params.status, params.busca),
      orderBy: { data: 'asc' },
      skip,
      take: params.limite,
      include: { procedimento: true },
    });
  }

  async contar(params: { status?: StatusAgendamento; busca?: string }): Promise<number> {
    return prisma.agendamento.count({
      where: this.montarWhere(params.status, params.busca),
    });
  }

  async buscarPorId(id: string): Promise<Agendamento | null> {
    return prisma.agendamento.findUnique({
      where: { id },
      include: { procedimento: true },
    });
  }

  async criar(dados: Prisma.AgendamentoUncheckedCreateInput): Promise<Agendamento> {
    return prisma.agendamento.create({
      data: dados,
      include: { procedimento: true },
    });
  }

  async atualizarStatus(id: string, status: StatusAgendamento): Promise<Agendamento> {
    return prisma.agendamento.update({
      where: { id },
      data: { status },
      include: { procedimento: true },
    });
  }

  private montarWhere(status?: StatusAgendamento, busca?: string): Prisma.AgendamentoWhereInput {
    const where: Prisma.AgendamentoWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
