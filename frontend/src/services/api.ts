import axios from 'axios';

// Cliente HTTP centralizado para comunicacao com a API OdontoAgenda.
// Usa variavel de ambiente VITE_API_URL ou fallback para desenvolvimento local.

const apiUrl: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepta erros para padronizar o formato da mensagem.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      'Erro inesperado. Tente novamente mais tarde.';

    return Promise.reject(new Error(message));
  },
);

export interface Procedimento {
  id: string;
  titulo: string;
  ativa: boolean;
  preco: string;
  duracaoMinutos: number;
}

export interface AgendamentoInput {
  nome: string;
  email: string;
  telefone?: string;
  data: string;
  horario: string;
  observacao?: string;
  procedimentoId: string;
}

export interface Agendamento {
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

export const publicApi = {
  listarProcedimentos: async (): Promise<Procedimento[]> => {
    const response = await api.get<Procedimento[]>('/procedimentos');
    return response.data;
  },

  criarAgendamento: async (dados: AgendamentoInput): Promise<Agendamento> => {
    const response = await api.post<Agendamento>('/agendamentos', dados);
    return response.data;
  },
};
