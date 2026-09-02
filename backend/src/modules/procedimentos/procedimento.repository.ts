import type { Procedimento } from '@prisma/client';

// Reexporta o tipo para facilitar o uso em outros modulos.
export type { Procedimento };

// Interface define o contrato do repositorio.
// A implementacao com Prisma fica separada, permitindo trocar a fonte de dados sem afetar os services.

export interface ProcedimentoRepository {
  listarAtivos(): Promise<Procedimento[]>;
  listarTodos(): Promise<Procedimento[]>;
  buscarPorId(id: string): Promise<Procedimento | null>;
  criar(dados: ProcedimentoData): Promise<Procedimento>;
  atualizar(id: string, dados: Partial<ProcedimentoData>): Promise<Procedimento>;
}

// Tipo compartilhado para criacao e atualizacao sem campos gerenciados pelo banco.
// Usa number para preco para manter a interface independente do Decimal do Prisma.
export interface ProcedimentoData {
  titulo: string;
  ativa: boolean;
  preco: number | null;
  duracaoMinutos: number | null;
}
