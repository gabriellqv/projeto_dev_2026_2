import type { Procedimento, Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.js';

import type { ProcedimentoRepository } from './procedimento.repository.js';

// Implementacao do repositorio usando Prisma ORM.
// A instancia do Prisma vem de um unico ponto de configuracao.

export class PrismaProcedimentoRepository implements ProcedimentoRepository {
  async listarAtivos(): Promise<Procedimento[]> {
    return prisma.procedimento.findMany({
      where: { ativa: true },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async buscarPorId(id: string): Promise<Procedimento | null> {
    return prisma.procedimento.findUnique({
      where: { id },
    });
  }

  async criar(dados: Prisma.ProcedimentoCreateInput): Promise<Procedimento> {
    return prisma.procedimento.create({ data: dados });
  }

  async atualizar(id: string, dados: Prisma.ProcedimentoUpdateInput): Promise<Procedimento> {
    return prisma.procedimento.update({
      where: { id },
      data: dados,
    });
  }
}
