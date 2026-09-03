import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AdminHeader } from '../components/AdminHeader.js';
import { formatarDataExibicao } from '../schemas/agendamento.schema.js';
import { adminApi, type AgendamentoDetalhe } from '../services/admin.service.js';

// Pagina administrativa que exibe os detalhes de um agendamento e seu historico de status.

export function AppointmentDetailPage(): React.ReactNode {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [detalhe, setDetalhe] = useState<AgendamentoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErro('ID do agendamento nao informado.');
      return;
    }

    const agendamentoId = id;
    let cancelado = false;

    async function carregar(): Promise<void> {
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await adminApi.buscarAgendamento(agendamentoId);
        if (!cancelado) setDetalhe(resposta);
      } catch (error) {
        if (!cancelado) {
          const mensagem = error instanceof Error ? error.message : 'Erro ao carregar detalhes.';
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
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <Link to="/admin" className="text-sm text-teal-600 hover:underline">
          ← Voltar para agendamentos
        </Link>

        <h1 className="mb-6 mt-4 text-2xl font-bold text-teal-800">Detalhes do agendamento</h1>

        {erro && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-sm text-red-700" role="alert">
            {erro}
          </div>
        )}

        {carregando && !detalhe && <p className="text-gray-600">Carregando...</p>}

        {detalhe && (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-teal-800">Dados do paciente</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Nome</dt>
                  <dd className="text-gray-900">{detalhe.agendamento.nome}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">E-mail</dt>
                  <dd className="text-gray-900">{detalhe.agendamento.email}</dd>
                </div>
                {detalhe.agendamento.telefone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Telefone</dt>
                    <dd className="text-gray-900">{detalhe.agendamento.telefone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-600">Data e horario</dt>
                  <dd className="text-gray-900">
                    {formatarDataExibicao(detalhe.agendamento.data)} às{' '}
                    {detalhe.agendamento.horario}
                  </dd>
                </div>
                {detalhe.agendamento.observacao && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Observacao</dt>
                    <dd className="text-gray-900">{detalhe.agendamento.observacao}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-teal-800">Historico de status</h2>
              {detalhe.historico.length === 0 ? (
                <p className="text-gray-600">Nenhuma alteracao de status registrada.</p>
              ) : (
                <ul className="space-y-3">
                  {detalhe.historico.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 pb-2">
                      <p className="text-sm text-gray-900">
                        {item.statusAnterior} → {item.statusNovo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatarDataExibicao(item.alteradoEm)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
