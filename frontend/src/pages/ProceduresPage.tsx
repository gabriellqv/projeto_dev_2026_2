import { useEffect, useState } from 'react';

import { AdminHeader } from '../components/AdminHeader.js';
import { adminApi, type Procedimento } from '../services/admin.service.js';

// Pagina administrativa para criar, editar e inativar procedimentos.

export function ProceduresPage(): React.ReactNode {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Procedimento | null>(null);

  const [titulo, setTitulo] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function carregar(): Promise<void> {
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await adminApi.listarProcedimentos();
        if (!cancelado) setProcedimentos(resposta);
      } catch (error) {
        if (!cancelado) {
          const mensagem =
            error instanceof Error ? error.message : 'Erro ao carregar procedimentos.';
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
  }, []);

  const limparFormulario = (): void => {
    setEditando(null);
    setTitulo('');
    setAtiva(true);
    setPreco('');
    setDuracao('');
  };

  const iniciarEdicao = (procedimento: Procedimento): void => {
    setEditando(procedimento);
    setTitulo(procedimento.titulo);
    setAtiva(procedimento.ativa);
    setPreco(procedimento.preco);
    setDuracao(procedimento.duracaoMinutos.toString());
  };

  const handleSubmit = async (): Promise<void> => {
    if (!titulo.trim()) {
      setErro('O titulo e obrigatorio.');
      return;
    }

    setErro(null);

    try {
      const dados = {
        titulo: titulo.trim(),
        ativa,
        preco: preco ? Number(preco) : null,
        duracaoMinutos: duracao ? Number(duracao) : null,
      };

      if (editando) {
        const id = editando.id;
        const atualizado = await adminApi.atualizarProcedimento(id, dados);
        setProcedimentos((anterior) =>
          anterior.map((p) => (p.id === atualizado.id ? atualizado : p)),
        );
      } else {
        const criado = await adminApi.criarProcedimento(dados);
        setProcedimentos((anterior) => [...anterior, criado]);
      }

      limparFormulario();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao salvar procedimento.';
      setErro(mensagem);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-teal-800">Procedimentos</h1>

        <section className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-teal-800">
            {editando ? 'Editar procedimento' : 'Novo procedimento'}
          </h2>

          {erro && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700" role="alert">
              {erro}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                Titulo
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(evento) => {
                  setTitulo(evento.target.value);
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="preco" className="block text-sm font-medium text-gray-700">
                Preco
              </label>
              <input
                id="preco"
                type="number"
                step="0.01"
                value={preco}
                onChange={(evento) => {
                  setPreco(evento.target.value);
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duracao" className="block text-sm font-medium text-gray-700">
                Duracao (minutos)
              </label>
              <input
                id="duracao"
                type="number"
                value={duracao}
                onChange={(evento) => {
                  setDuracao(evento.target.value);
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ativa"
                type="checkbox"
                checked={ativa}
                onChange={(evento) => {
                  setAtiva(evento.target.checked);
                }}
                className="h-4 w-4"
              />
              <label htmlFor="ativa" className="text-sm font-medium text-gray-700">
                Ativo
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              className="rounded-md bg-teal-600 px-6 py-2 font-semibold text-white hover:bg-teal-700"
            >
              {editando ? 'Salvar alteracoes' : 'Cadastrar'}
            </button>

            {editando && (
              <button
                type="button"
                onClick={limparFormulario}
                className="rounded-md border border-gray-300 bg-white px-6 py-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </section>

        <section className="rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Titulo</th>
                <th className="px-4 py-3 font-medium">Preco</th>
                <th className="px-4 py-3 font-medium">Duracao</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carregando && procedimentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-600">
                    Carregando...
                  </td>
                </tr>
              ) : (
                procedimentos.map((procedimento) => (
                  <tr key={procedimento.id}>
                    <td className="px-4 py-3">{procedimento.titulo}</td>
                    <td className="px-4 py-3">R$ {procedimento.preco}</td>
                    <td className="px-4 py-3">{procedimento.duracaoMinutos} min</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          procedimento.ativa
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {procedimento.ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          iniciarEdicao(procedimento);
                        }}
                        className="text-teal-600 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
