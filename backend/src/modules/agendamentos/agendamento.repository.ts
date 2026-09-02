import type { Agendamento, Prisma, StatusAgendamento } from '@prisma/client';

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
  criar(dados: Prisma.AgendamentoUncheckedCreateInput): Promise<Agendamento>;
  atualizarStatus(id: string, status: StatusAgendamento): Promise<Agendamento>;
}
