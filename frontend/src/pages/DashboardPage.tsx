import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { AdminHeader } from '../components/AdminHeader.js';
import { formatarDataExibicao } from '../schemas/agendamento.schema.js';
import {
  adminApi,
  type AgendamentoAdmin,
  type StatusAgendamento,
} from '../services/admin.service.js';

// Pagina administrativa que lista agendamentos com filtros e paginacao.

export function DashboardPage(): React.ReactNode {
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar(): Promise<void> {
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await adminApi.listarAgendamentos({
          status: statusFiltro || undefined,
          busca: busca || undefined,
          pagina,
          limite,
        });

        if (!cancelado) {
          setAgendamentos(resposta.agendamentos);
          setTotal(resposta.total);
        }
      } catch (error) {
        if (!cancelado) {
          const mensagem =
            error instanceof Error ? error.message : 'Erro ao carregar agendamentos.';
          setErro(mensagem);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      cancelado = true;
    };
  }, [pagina, statusFiltro, busca, limite]);

  const handleStatusChange = async (id: string, novoStatus: StatusAgendamento): Promise<void> => {
    try {
      await adminApi.atualizarStatus(id, novoStatus);
      setAgendamentos((anterior) =>
        anterior.map((agendamento) =>
          agendamento.id === id ? { ...agendamento, status: novoStatus } : agendamento,
        ),
      );
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao atualizar status.';
      setErro(mensagem);
    }
  };

  const totalPaginas = Math.ceil(total / limite);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-teal-800">Agendamentos</h1>

        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row">
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail"
            value={busca}
            onChange={(evento) => {
              setBusca(evento.target.value);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none md:flex-1"
          />

          <select
            value={statusFiltro}
            onChange={(evento) => {
              setStatusFiltro(evento.target.value);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
          >
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="ATENDIDO">Atendido</option>
          </select>
        </div>

        {erro && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-sm text-red-700" role="alert">
            {erro}
          </div>
        )}

        {carregando && agendamentos.length === 0 ? (
          <p className="text-gray-600">Carregando...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Horario</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agendamentos.map((agendamento) => (
                  <tr key={agendamento.id}>
                    <td className="px-4 py-3">{agendamento.nome}</td>
                    <td className="px-4 py-3">{formatarDataExibicao(agendamento.data)}</td>
                    <td className="px-4 py-3">{agendamento.horario}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          statusCores[agendamento.status as StatusAgendamento]
                        }`}
                      >
                        {agendamento.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={agendamento.status}
                          onChange={(evento) => {
                            void handleStatusChange(
                              agendamento.id,
                              evento.target.value as StatusAgendamento,
                            );
                          }}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                        >
                          <option value="PENDENTE">Pendente</option>
                          <option value="CONFIRMADO">Confirmado</option>
                          <option value="CANCELADO">Cancelado</option>
                          <option value="ATENDIDO">Atendido</option>
                        </select>
                        <Link
                          to={`/admin/agendamentos/${agendamento.id}`}
                          className="text-teal-600 hover:underline"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setPagina((anterior) => Math.max(1, anterior - 1));
              }}
              disabled={pagina === 1}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Pagina {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => {
                setPagina((anterior) => Math.min(totalPaginas, anterior + 1));
              }}
              disabled={pagina === totalPaginas}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 disabled:opacity-50"
            >
              Proximo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const statusCores: Record<StatusAgendamento, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
  ATENDIDO: 'bg-blue-100 text-blue-800',
};
