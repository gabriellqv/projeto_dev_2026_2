import { useState, type SyntheticEvent } from 'react';

import {
  agendamentoSchema,
  formatarTelefone,
  gerarHorarios,
} from '../schemas/agendamento.schema.js';
import type { AgendamentoFormData } from '../schemas/agendamento.schema.js';
import type { Procedimento } from '../services/api.js';

interface AppointmentFormProps {
  procedimentos: Procedimento[];
  onSubmit: (dados: AgendamentoFormData) => void;
  carregando: boolean;
}

// Formulario publico de agendamento de consulta.
// Valida os campos com Zod antes de chamar a API.

export function AppointmentForm({
  procedimentos,
  onSubmit,
  carregando,
}: AppointmentFormProps): React.ReactNode {
  const [dados, setDados] = useState<AgendamentoFormData>({
    nome: '',
    email: '',
    telefone: '',
    data: '',
    horario: '',
    observacao: '',
    procedimentoId: '',
  });

  const [erros, setErros] = useState<Partial<Record<keyof AgendamentoFormData, string>>>({});

  const handleChange = (campo: keyof AgendamentoFormData, valor: string): void => {
    setDados((anterior) => ({
      ...anterior,
      [campo]: campo === 'telefone' ? formatarTelefone(valor) : valor,
    }));

    setErros((anterior) => {
      return { ...anterior, [campo]: undefined };
    });
  };

  const handleProcedimento = (id: string): void => {
    handleChange('procedimentoId', id);
  };

  const handleSubmit = (evento: SyntheticEvent<HTMLFormElement>): void => {
    evento.preventDefault();

    const resultado = agendamentoSchema.safeParse(dados);

    if (!resultado.success) {
      const novosErros: Partial<Record<keyof AgendamentoFormData, string>> = {};

      for (const issue of resultado.error.issues) {
        const campo = issue.path[0] as keyof AgendamentoFormData;
        novosErros[campo] = issue.message;
      }

      setErros(novosErros);
      return;
    }

    onSubmit(resultado.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome completo
        </label>
        <input
          id="nome"
          type="text"
          value={dados.nome}
          onChange={(evento) => {
            handleChange('nome', evento.target.value);
          }}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
          disabled={carregando}
        />
        {erros.nome && <p className="text-sm text-red-600">{erros.nome}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={dados.email}
            onChange={(evento) => {
              handleChange('email', evento.target.value);
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
            disabled={carregando}
          />
          {erros.email && <p className="text-sm text-red-600">{erros.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            id="telefone"
            type="tel"
            value={dados.telefone}
            onChange={(evento) => {
              handleChange('telefone', evento.target.value);
            }}
            placeholder="(31) 98765-4321"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
            disabled={carregando}
          />
          {erros.telefone && <p className="text-sm text-red-600">{erros.telefone}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="data" className="block text-sm font-medium text-gray-700">
            Data
          </label>
          <input
            id="data"
            type="date"
            value={dados.data}
            min={new Date().toISOString().split('T')[0]}
            onChange={(evento) => {
              handleChange('data', evento.target.value);
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
            disabled={carregando}
          />
          {erros.data && <p className="text-sm text-red-600">{erros.data}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="horario" className="block text-sm font-medium text-gray-700">
            Horario
          </label>
          <select
            id="horario"
            value={dados.horario}
            onChange={(evento) => {
              handleChange('horario', evento.target.value);
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
            disabled={carregando}
          >
            <option value="">Selecione</option>
            {gerarHorarios().map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </select>
          {erros.horario && <p className="text-sm text-red-600">{erros.horario}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="procedimento" className="block text-sm font-medium text-gray-700">
          Procedimento
        </label>
        <ProcedureSelector
          procedimentos={procedimentos}
          selecionadoId={dados.procedimentoId}
          onSelect={handleProcedimento}
        />
        {erros.procedimentoId && <p className="text-sm text-red-600">{erros.procedimentoId}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
          Observacoes
        </label>
        <textarea
          id="observacao"
          value={dados.observacao}
          onChange={(evento) => {
            handleChange('observacao', evento.target.value);
          }}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
          disabled={carregando}
        />
        {erros.observacao && <p className="text-sm text-red-600">{erros.observacao}</p>}
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-md bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? 'Enviando...' : 'Confirmar agendamento'}
      </button>
    </form>
  );
}

interface ProcedureSelectorProps {
  procedimentos: Procedimento[];
  selecionadoId: string;
  onSelect: (id: string) => void;
}

// Seletor alternativo de procedimento via select, usado como fallback para acessibilidade.

function ProcedureSelector({
  procedimentos,
  selecionadoId,
  onSelect,
}: ProcedureSelectorProps): React.ReactNode {
  if (procedimentos.length === 0) {
    return <p className="text-sm text-gray-500">Carregando procedimentos disponiveis...</p>;
  }

  return (
    <select
      value={selecionadoId}
      onChange={(evento) => {
        onSelect(evento.target.value);
      }}
      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
    >
      <option value="">Selecione um procedimento</option>
      {procedimentos.map((procedimento) => (
        <option key={procedimento.id} value={procedimento.id}>
          {procedimento.titulo}
        </option>
      ))}
    </select>
  );
}
