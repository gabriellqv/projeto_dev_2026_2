import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Header } from '../components/Header.js';
import { formatarDataExibicao } from '../schemas/agendamento.schema.js';
import type { Agendamento } from '../services/api.js';

// Pagina de confirmacao exibida apos um agendamento bem-sucedido.
// Recebe os dados do agendamento via estado da navegacao.

interface LocationState {
  agendamento?: Agendamento;
}

export function ConfirmationPage(): React.ReactNode {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const agendamento = state?.agendamento;

  if (!agendamento) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-teal-800">Nenhuma confirmacao encontrada</h2>
          <p className="mt-4 text-gray-700">
            Volte a pagina inicial para fazer um novo agendamento.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
          >
            Fazer agendamento
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-teal-800">Agendamento realizado!</h2>
            <p className="text-gray-600">Enviamos os detalhes para o e-mail {agendamento.email}.</p>
          </div>

          <dl className="divide-y divide-gray-200 border-t border-gray-200">
            <div className="flex justify-between py-3">
              <dt className="font-medium text-gray-700">Nome</dt>
              <dd className="text-gray-900">{agendamento.nome}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-medium text-gray-700">Data</dt>
              <dd className="text-gray-900">{formatarDataExibicao(agendamento.data)}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-medium text-gray-700">Horario</dt>
              <dd className="text-gray-900">{agendamento.horario}</dd>
            </div>
            {agendamento.telefone && (
              <div className="flex justify-between py-3">
                <dt className="font-medium text-gray-700">Telefone</dt>
                <dd className="text-gray-900">{agendamento.telefone}</dd>
              </div>
            )}
            {agendamento.observacao && (
              <div className="flex flex-col gap-1 py-3">
                <dt className="font-medium text-gray-700">Observacao</dt>
                <dd className="text-gray-900">{agendamento.observacao}</dd>
              </div>
            )}
          </dl>

          <button
            onClick={() => {
              void navigate('/');
            }}
            className="mt-6 w-full rounded-md bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
          >
            Fazer novo agendamento
          </button>
        </div>
      </main>
    </div>
  );
}
