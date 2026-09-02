import type { Procedimento, Prisma } from '@prisma/client';

// Interface define o contrato do repositorio.
// A implementacao com Prisma fica separada, permitindo trocar a fonte de dados sem afetar os services.

export interface ProcedimentoRepository {
  listarAtivos(): Promise<Procedimento[]>;
  buscarPorId(id: string): Promise<Procedimento | null>;
  criar(dados: Prisma.ProcedimentoCreateInput): Promise<Procedimento>;
  atualizar(id: string, dados: Prisma.ProcedimentoUpdateInput): Promise<Procedimento>;
}
