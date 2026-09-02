import type { Agendamento, StatusAgendamento } from '@prisma/client';

// Reexporta os tipos para facilitar o uso em outros modulos.
export type { Agendamento, StatusAgendamento };

// Interface do repositorio de agendamentos.
// Separa a logica de persistencia da logica de negocio.

export interface AgendamentoRepository {
  listar(params: {
    status?: StatusAgendamento;
    busca?: string;
    pagina: number;
    limite: number;
  }): Promise<Agendamento[]>;
  contar(params: { status?: StatusAgendamento; busca?: string }): Promise<number>;
  buscarPorId(id: string): Promise<Agendamento | null>;
  criar(dados: AgendamentoData): Promise<Agendamento>;
  atualizarStatus(id: string, status: StatusAgendamento): Promise<Agendamento>;
}

// Tipo compartilhado para criacao sem campos gerenciados pelo banco.
export type AgendamentoData = Pick<
  Agendamento,
  'nome' | 'email' | 'telefone' | 'data' | 'horario' | 'observacao' | 'procedimentoId'
>;
