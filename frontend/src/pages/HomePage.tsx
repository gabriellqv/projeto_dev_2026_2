import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppointmentForm } from '../components/AppointmentForm.js';
import { Header } from '../components/Header.js';
import { HeroSection } from '../components/HeroSection.js';
import { ProcedureList } from '../components/ProcedureList.js';
import type { AgendamentoFormData } from '../schemas/agendamento.schema.js';
import { publicApi, type Procedimento } from '../services/api.js';

// Pagina publica principal: apresenta a clinica, lista procedimentos e permite agendar.

export function HomePage(): React.ReactNode {
  const navigate = useNavigate();

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function carregar(): Promise<void> {
      try {
        const lista = await publicApi.listarProcedimentos();
        if (!cancelado) setProcedimentos(lista);
      } catch {
        if (!cancelado) setErro('Nao foi possivel carregar os procedimentos.');
      }
    }

    void carregar();

    return () => {
      cancelado = true;
    };
  }, []);

  const handleSubmit = async (dados: AgendamentoFormData): Promise<void> => {
    setCarregando(true);
    setErro(null);

    try {
      const agendamento = await publicApi.criarAgendamento(dados);
      await navigate('/confirmacao', { state: { agendamento } });
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao criar agendamento.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />

      <main className="container mx-auto space-y-12 px-4 py-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-teal-800">Procedimentos disponiveis</h2>
          <ProcedureList
            procedimentos={procedimentos}
            selecionadoId={procedimentoSelecionado}
            onSelect={setProcedimentoSelecionado}
          />
        </section>

        <section className="mx-auto max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-teal-800">Faca seu agendamento</h2>

          {erro && (
            <div className="rounded-md bg-red-100 p-4 text-sm text-red-700" role="alert">
              {erro}
            </div>
          )}

          <AppointmentForm
            procedimentos={procedimentos}
            onSubmit={(dados) => {
              void handleSubmit(dados);
            }}
            carregando={carregando}
          />
        </section>
      </main>
    </div>
  );
}
