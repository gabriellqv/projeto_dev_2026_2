import axios from 'axios';

// Cliente HTTP centralizado para comunicação com a API OdontoAgenda.
// Valida a presença da URL da API em produção ou utiliza fallback seguro em desenvolvimento local.

const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (import.meta.env.PROD && !envApiUrl) {
  throw new Error('VITE_API_URL não configurada. Defina a URL da API no build.');
}

const apiUrl: string = envApiUrl ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepta erros para padronizar o formato da mensagem.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as {
      response?: { data?: { message?: string; errors?: string[] } };
      message?: string;
    };
    const errData = axiosError.response?.data;
    const message =
      errData?.errors && errData.errors.length > 0
        ? `${errData.message ?? 'Erro'}: ${errData.errors.join(', ')}`
        : (errData?.message ??
          axiosError.message ??
          'Erro inesperado. Tente novamente mais tarde.');

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
