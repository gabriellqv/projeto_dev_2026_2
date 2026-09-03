import type { Procedimento } from '../services/api.js';

interface ProcedureListProps {
  procedimentos: Procedimento[];
  selecionadoId: string;
  onSelect: (id: string) => void;
}

// Grade visual de cards para selecao de procedimento.
// Exibe apenas os procedimentos ativos retornados pela API.

export function ProcedureList({
  procedimentos,
  selecionadoId,
  onSelect,
}: ProcedureListProps): React.ReactNode {
  if (procedimentos.length === 0) {
    return <p className="text-center text-gray-600">Nenhum procedimento disponivel no momento.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {procedimentos.map((procedimento) => (
        <button
          key={procedimento.id}
          type="button"
          onClick={() => {
            onSelect(procedimento.id);
          }}
          className={`rounded-lg border-2 p-4 text-left transition hover:shadow-md ${
            selecionadoId === procedimento.id
              ? 'border-teal-600 bg-teal-50'
              : 'border-gray-200 bg-white'
          }`}
          aria-pressed={selecionadoId === procedimento.id}
        >
          <h3 className="font-semibold text-teal-800">{procedimento.titulo}</h3>
          <p className="text-sm text-gray-600">Duracao: {procedimento.duracaoMinutos} min</p>
          {procedimento.preco && (
            <p className="mt-2 font-bold text-teal-700">R$ {procedimento.preco}</p>
          )}
        </button>
      ))}
    </div>
  );
}
