import { api } from './api.js';

// Servico de API para as operacoes administrativas protegidas por JWT.

export interface Procedimento {
  id: string;
  titulo: string;
  ativa: boolean;
  preco: string;
  duracaoMinutos: number;
}

export interface AgendamentoAdmin {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  data: string;
  horario: string;
  observacao: string | null;
  status: string;
  procedimentoId: string;
}

export interface HistoricoStatus {
  id: string;
  agendamentoId: string;
  statusAnterior: string;
  statusNovo: string;
  alteradoEm: string;
}

export interface AgendamentoDetalhe {
  agendamento: AgendamentoAdmin;
  historico: HistoricoStatus[];
}

export interface ListagemAgendamentos {
  agendamentos: AgendamentoAdmin[];
  total: number;
}

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'ATENDIDO';

export const adminApi = {
  async listarAgendamentos(params: {
    status?: string;
    busca?: string;
    pagina: number;
    limite: number;
  }): Promise<ListagemAgendamentos> {
    const response = await api.get<ListagemAgendamentos>('/admin/agendamentos', { params });
    return response.data;
  },

  async buscarAgendamento(id: string): Promise<AgendamentoDetalhe> {
    const response = await api.get<AgendamentoDetalhe>(`/admin/agendamentos/${id}`);
    return response.data;
  },

  async atualizarStatus(id: string, status: StatusAgendamento): Promise<AgendamentoAdmin> {
    const response = await api.patch<AgendamentoAdmin>(`/admin/agendamentos/${id}/status`, {
      status,
    });
    return response.data;
  },

  async listarProcedimentos(): Promise<Procedimento[]> {
    const response = await api.get<Procedimento[]>('/admin/procedimentos');
    return response.data;
  },

  async criarProcedimento(dados: {
    titulo: string;
    ativa: boolean;
    preco?: number | null;
    duracaoMinutos?: number | null;
  }): Promise<Procedimento> {
    const response = await api.post<Procedimento>('/admin/procedimentos', dados);
    return response.data;
  },

  async atualizarProcedimento(
    id: string,
    dados: {
      titulo?: string;
      ativa?: boolean;
      preco?: number | null;
      duracaoMinutos?: number | null;
    },
  ): Promise<Procedimento> {
    const response = await api.patch<Procedimento>(`/admin/procedimentos/${id}`, dados);
    return response.data;
  },
};
