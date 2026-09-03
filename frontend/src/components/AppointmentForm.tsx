import { useState, useEffect, useRef, type SyntheticEvent } from 'react';

import { cn } from '../lib/cn';
import { agendamentoSchema, formatarTelefone, gerarHorarios } from '../schemas/agendamento.schema';
import type { AgendamentoFormData } from '../schemas/agendamento.schema';
import type { Procedimento } from '../services/api';

import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';

interface AppointmentFormProps {
  procedimentos: Procedimento[];
  onSubmit: (dados: AgendamentoFormData) => void;
  carregando: boolean;
  procedimentoPreSelecionadoId?: string;
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Normaliza títulos de procedimentos com acentuação correta
function formatarTitulo(titulo: string): string {
  if (
    titulo.toLowerCase().includes('restauracao') ||
    titulo.toLowerCase().includes('restauração')
  ) {
    return 'Restauração de Resina';
  }
  return titulo;
}

// Ícones contextuais por tipo de procedimento
function obterIcone(titulo: string): React.ReactNode {
  const normalizado = titulo.toLowerCase();

  if (normalizado.includes('clareamento')) {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    );
  }
  if (normalizado.includes('limpeza') || normalizado.includes('profilaxia')) {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    );
  }
  if (normalizado.includes('canal')) {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

// Formulário público de agendamento de consultas com UI personalizada e Dark Mode odontológico refinado.

export function AppointmentForm({
  procedimentos,
  onSubmit,
  carregando,
  procedimentoPreSelecionadoId,
}: AppointmentFormProps): React.ReactNode {
  const [dados, setDados] = useState<AgendamentoFormData>({
    nome: '',
    email: '',
    telefone: '',
    procedimentoId: procedimentoPreSelecionadoId ?? '',
    data: '',
    horario: '',
    observacao: '',
  });

  const [erros, setErros] = useState<Record<string, string>>({});

  // Estados dos menus e pickers customizados
  const [procedimentoAberto, setProcedimentoAberto] = useState(false);
  const [dataAberta, setDataAberta] = useState(false);
  const [horarioAberto, setHorarioAberto] = useState(false);

  // Calendário interativo: Mês e Ano de navegação
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

  const procedimentoRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const horarioRef = useRef<HTMLDivElement>(null);

  // Horários disponíveis divididos por turnos (Manhã e Tarde)
  const horarios = gerarHorarios();
  const horariosManha = horarios.filter((h) => {
    const hora = Number.parseInt(h.split(':')[0], 10);
    return hora < 12;
  });
  const horariosTarde = horarios.filter((h) => {
    const hora = Number.parseInt(h.split(':')[0], 10);
    return hora >= 12;
  });

  // Atualiza seleção ao receber pré-seleção externa
  useEffect(() => {
    if (procedimentoPreSelecionadoId) {
      setDados((prev) => ({ ...prev, procedimentoId: procedimentoPreSelecionadoId }));
    }
  }, [procedimentoPreSelecionadoId]);

  // Fecha dropdowns e calendários ao clicar fora
  useEffect(() => {
    function handleClickFora(event: MouseEvent): void {
      if (procedimentoRef.current && !procedimentoRef.current.contains(event.target as Node)) {
        setProcedimentoAberto(false);
      }
      if (dataRef.current && !dataRef.current.contains(event.target as Node)) {
        setDataAberta(false);
      }
      if (horarioRef.current && !horarioRef.current.contains(event.target as Node)) {
        setHorarioAberto(false);
      }
    }

    document.addEventListener('mousedown', handleClickFora);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  const handleChange = (campo: keyof AgendamentoFormData, valor: string): void => {
    let valorFormatado = valor;
    if (campo === 'telefone') {
      valorFormatado = formatarTelefone(valor);
    }

    setDados((prev) => ({ ...prev, [campo]: valorFormatado }));

    if (erros[campo]) {
      setErros((prev) => {
        const { [campo]: _removido, ...resto } = prev;
        return resto;
      });
    }
  };

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    const resultado = agendamentoSchema.safeParse(dados);
    if (!resultado.success) {
      const novosErros: Record<string, string> = {};
      for (const erro of resultado.error.issues) {
        const campo = erro.path[0];
        if (typeof campo === 'string' && !novosErros[campo]) {
          novosErros[campo] = erro.message;
        }
      }
      setErros(novosErros);
      return;
    }

    setErros({});
    onSubmit(resultado.data);
  };

  const procedimentoSelecionado = procedimentos.find((p) => p.id === dados.procedimentoId);

  // Cálculo dos dias do mês para o calendário customizado
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDiasMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const mesAnterior = (): void => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual((prev) => prev - 1);
    } else {
      setMesAtual((prev) => prev - 1);
    }
  };

  const proximoMes = (): void => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual((prev) => prev + 1);
    } else {
      setMesAtual((prev) => prev + 1);
    }
  };

  // Formata data ISO (YYYY-MM-DD) para exibição amigável em PT-BR
  const formatarDataExibicao = (dataIso: string): string => {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* 1. Seleção Personalizada do Procedimento (Custom Dropdown) */}
      <div className="space-y-2 relative" ref={procedimentoRef}>
        <label
          htmlFor="procedimento-btn"
          className="flex items-center gap-1.5 text-sm font-bold text-primary"
        >
          <svg
            className="h-4 w-4 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Procedimento Desejado <span className="text-danger">*</span>
        </label>

        {/* Gatilho do Dropdown Customizado */}
        <button
          id="procedimento-btn"
          type="button"
          disabled={carregando}
          onClick={() => {
            setProcedimentoAberto(!procedimentoAberto);
            setDataAberta(false);
            setHorarioAberto(false);
          }}
          className={cn(
            'w-full flex items-center justify-between rounded-2xl border bg-surface p-3.5 sm:p-4 text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-inset',
            procedimentoAberto
              ? 'border-accent ring-2 ring-accent/20 shadow-md'
              : erros.procedimentoId
                ? 'border-danger bg-danger/10'
                : 'border-default hover:border-accent',
          )}
        >
          {procedimentoSelecionado ? (
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent font-bold border border-accent/20 shadow-sm">
                {obterIcone(procedimentoSelecionado.titulo)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-primary text-sm sm:text-base">
                    {formatarTitulo(procedimentoSelecionado.titulo)}
                  </span>
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                    {procedimentoSelecionado.preco
                      ? `R$ ${Number(procedimentoSelecionado.preco).toFixed(2).replace('.', ',')}`
                      : 'Sob consulta'}
                  </span>
                </div>
                <p className="text-xs text-muted font-medium mt-0.5">
                  Duração estimada: ~{procedimentoSelecionado.duracaoMinutos} minutos
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-muted text-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-hover text-muted">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <span>Selecione um procedimento na lista...</span>
            </div>
          )}

          <div className="ml-3 shrink-0 text-muted transition-transform duration-300">
            <svg
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                procedimentoAberto && 'rotate-180 text-accent',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Menu Flutuante Customizado */}
        {procedimentoAberto && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-subtle bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-80 overflow-y-auto p-2 space-y-1.5 overscroll-contain">
              {procedimentos.map((p) => {
                const selecionado = p.id === dados.procedimentoId;
                const titulo = formatarTitulo(p.titulo);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      handleChange('procedimentoId', p.id);
                      setProcedimentoAberto(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between rounded-xl p-3 text-left transition-all border',
                      selecionado
                        ? 'bg-accent/10 text-accent border-accent/30 shadow-sm'
                        : 'hover:bg-surface-hover text-secondary hover:border-subtle border-transparent',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                          selecionado
                            ? 'bg-accent text-white shadow-sm'
                            : 'bg-accent/10 text-accent',
                        )}
                      >
                        {obterIcone(p.titulo)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary">{titulo}</h4>
                        <p className="text-xs text-muted">
                          ~{p.duracaoMinutos} min •{' '}
                          {p.preco
                            ? `R$ ${Number(p.preco).toFixed(2).replace('.', ',')}`
                            : 'Sob consulta'}
                        </p>
                      </div>
                    </div>
                    {selecionado && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {erros.procedimentoId && (
          <p className="text-xs font-semibold text-danger">{erros.procedimentoId}</p>
        )}
      </div>

      {/* 2. Dados Pessoais do Paciente (Nome, Email, Telefone) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Nome Completo */}
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="nome"
            className="flex items-center gap-1.5 text-sm font-bold text-primary"
          >
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Nome Completo <span className="text-danger">*</span>
          </label>
          <Input
            id="nome"
            type="text"
            placeholder="Ex: Maria Clara Silva"
            value={dados.nome}
            onChange={(e) => {
              handleChange('nome', e.target.value);
            }}
            disabled={carregando}
            error={Boolean(erros.nome)}
            className={erros.nome ? 'bg-danger/10' : ''}
          />
          {erros.nome && <p className="text-xs font-semibold text-danger">{erros.nome}</p>}
        </div>

        {/* E-mail */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="flex items-center gap-1.5 text-sm font-bold text-primary"
          >
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            E-mail para Confirmação <span className="text-danger">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={dados.email}
            onChange={(e) => {
              handleChange('email', e.target.value);
            }}
            disabled={carregando}
            error={Boolean(erros.email)}
            className={erros.email ? 'bg-danger/10' : ''}
          />
          {erros.email && <p className="text-xs font-semibold text-danger">{erros.email}</p>}
        </div>

        {/* Telefone / WhatsApp */}
        <div className="space-y-1.5">
          <label
            htmlFor="telefone"
            className="flex items-center gap-1.5 text-sm font-bold text-primary"
          >
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            WhatsApp / Telefone <span className="text-danger">*</span>
          </label>
          <Input
            id="telefone"
            type="tel"
            placeholder="(38) 90000-0000"
            value={dados.telefone}
            onChange={(e) => {
              handleChange('telefone', e.target.value);
            }}
            disabled={carregando}
            maxLength={15}
            error={Boolean(erros.telefone)}
            className={erros.telefone ? 'bg-danger/10' : ''}
          />
          {erros.telefone && <p className="text-xs font-semibold text-danger">{erros.telefone}</p>}
        </div>
      </div>

      {/* 3. Seleção de Data e Horário (Calendário Interativo + Chips de Turnos) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Seletor de Data com Calendário */}
        <div className="space-y-1.5 relative" ref={dataRef}>
          <label
            htmlFor="data-btn"
            className="flex items-center gap-1.5 text-sm font-bold text-primary"
          >
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Data da Consulta <span className="text-danger">*</span>
          </label>

          {/* Gatilho do Calendário */}
          <button
            id="data-btn"
            type="button"
            disabled={carregando}
            onClick={() => {
              setDataAberta(!dataAberta);
              setProcedimentoAberto(false);
              setHorarioAberto(false);
            }}
            className={cn(
              'w-full flex items-center justify-between rounded-xl border bg-surface px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-inset',
              dataAberta
                ? 'border-accent ring-2 ring-accent/20 shadow-md'
                : erros.data
                  ? 'border-danger bg-danger/10'
                  : 'border-default hover:border-accent',
            )}
          >
            <div className="flex items-center gap-2.5 text-secondary">
              <svg
                className="h-4 w-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span
                className={cn(dados.data ? 'font-bold text-primary' : 'text-muted font-normal')}
              >
                {dados.data
                  ? formatarDataExibicao(dados.data)
                  : 'Selecione a data no calendário...'}
              </span>
            </div>
            <svg
              className={cn(
                'h-4 w-4 text-muted transition-transform duration-300',
                dataAberta && 'rotate-180 text-accent',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Popup do Calendário Interativo Estendido */}
          {dataAberta && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 w-full rounded-2xl border border-subtle bg-surface p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Cabeçalho do Mês / Navegação */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={mesAnterior}
                  aria-label="Mês anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-hover text-secondary transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <span className="font-bold text-primary text-sm">
                  {MESES[mesAtual]} de {anoAtual}
                </span>

                <button
                  type="button"
                  onClick={proximoMes}
                  aria-label="Próximo mês"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-hover text-secondary transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted mb-2">
                {DIAS_SEMANA.map((dia, idx) => (
                  <span key={idx} className={cn(idx === 0 && 'text-rose-400')}>
                    {dia}
                  </span>
                ))}
              </div>

              {/* Matriz dos Dias */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                  <span key={`vazio-${String(i)}`} />
                ))}

                {Array.from({ length: totalDiasMes }).map((_, i) => {
                  const numeroDia = i + 1;
                  const diaFormatado = String(numeroDia).padStart(2, '0');
                  const mesFormatado = String(mesAtual + 1).padStart(2, '0');
                  const dataIso = `${String(anoAtual)}-${mesFormatado}-${diaFormatado}`;
                  const dataObj = new Date(anoAtual, mesAtual, numeroDia);
                  const hojeFormatado = new Date(
                    hoje.getFullYear(),
                    hoje.getMonth(),
                    hoje.getDate(),
                  );

                  const noPassado = dataObj < hojeFormatado;
                  const eDomingo = dataObj.getDay() === 0;
                  const desabilitado = noPassado || eDomingo;
                  const selecionado = dados.data === dataIso;
                  const eHoje = dataObj.getTime() === hojeFormatado.getTime();

                  return (
                    <button
                      key={dataIso}
                      type="button"
                      disabled={desabilitado}
                      aria-label={`${String(numeroDia)} de ${MESES[mesAtual]} de ${String(anoAtual)}${eHoje ? ', hoje' : ''}${desabilitado ? ', indisponível' : ''}`}
                      onClick={() => {
                        handleChange('data', dataIso);
                        setDataAberta(false);
                      }}
                      className={cn(
                        'h-9 w-full flex items-center justify-center rounded-xl font-semibold transition-all',
                        selecionado
                          ? 'bg-accent text-white font-bold shadow-md ring-2 ring-accent/30 scale-105'
                          : desabilitado
                            ? 'text-border-default cursor-not-allowed opacity-40'
                            : eHoje
                              ? 'border-2 border-accent text-accent hover:bg-accent/10'
                              : 'text-secondary hover:bg-accent/10 hover:text-accent',
                      )}
                    >
                      {numeroDia}
                    </button>
                  );
                })}
              </div>

              {/* Rodapé com atalhos */}
              <div className="mt-3 pt-3 border-t border-subtle flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('data', '');
                    setDataAberta(false);
                  }}
                  className="text-muted hover:text-primary"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const diaFmt = String(hoje.getDate()).padStart(2, '0');
                    const mesFmt = String(hoje.getMonth() + 1).padStart(2, '0');
                    const dataHojeIso = `${String(hoje.getFullYear())}-${mesFmt}-${diaFmt}`;
                    handleChange('data', dataHojeIso);
                    setDataAberta(false);
                  }}
                  className="text-accent hover:text-accent-hover font-bold"
                >
                  Hoje
                </button>
              </div>
            </div>
          )}

          {erros.data && <p className="text-xs font-semibold text-danger">{erros.data}</p>}
        </div>

        {/* Seletor de Horários Personalizado */}
        <div className="space-y-1.5 relative" ref={horarioRef}>
          <label
            htmlFor="horario-btn"
            className="flex items-center gap-1.5 text-sm font-bold text-primary"
          >
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Horário Desejado <span className="text-danger">*</span>
          </label>

          {/* Gatilho do Seletor de Horário */}
          <button
            id="horario-btn"
            type="button"
            disabled={carregando}
            onClick={() => {
              setHorarioAberto(!horarioAberto);
              setProcedimentoAberto(false);
              setDataAberta(false);
            }}
            className={cn(
              'w-full flex items-center justify-between rounded-xl border bg-surface px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-inset',
              horarioAberto
                ? 'border-accent ring-2 ring-accent/20 shadow-md'
                : erros.horario
                  ? 'border-danger bg-danger/10'
                  : 'border-default hover:border-accent',
            )}
          >
            <div className="flex items-center gap-2.5 text-secondary">
              <svg
                className="h-4 w-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className={cn(dados.horario ? 'font-bold text-primary' : 'text-muted font-normal')}
              >
                {dados.horario ? `${dados.horario} horas` : 'Selecione o horário...'}
              </span>
            </div>
            <svg
              className={cn(
                'h-4 w-4 text-muted transition-transform duration-300',
                horarioAberto && 'rotate-180 text-accent',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Popup com Chips de Horários por Turno Estendido */}
          {horarioAberto && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 w-full rounded-2xl border border-subtle bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="max-h-80 overflow-y-auto p-4 space-y-4 overscroll-contain">
                {/* Turno da Manhã */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                    <svg
                      className="h-4 w-4 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>Período da Manhã</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {horariosManha.map((h) => {
                      const selecionado = dados.horario === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            handleChange('horario', h);
                            setHorarioAberto(false);
                          }}
                          className={cn(
                            'py-2 px-1 rounded-xl text-xs font-bold transition-all border',
                            selecionado
                              ? 'bg-accent text-white shadow-md ring-2 ring-accent/30'
                              : 'bg-surface-hover text-secondary hover:bg-accent/10 hover:text-accent hover:border-accent/30 border-subtle',
                          )}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Turno da Tarde */}
                <div className="pt-2 border-t border-subtle">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                    <svg
                      className="h-4 w-4 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Período da Tarde</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {horariosTarde.map((h) => {
                      const selecionado = dados.horario === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            handleChange('horario', h);
                            setHorarioAberto(false);
                          }}
                          className={cn(
                            'py-2 px-1 rounded-xl text-xs font-bold transition-all border',
                            selecionado
                              ? 'bg-accent text-white shadow-md ring-2 ring-accent/30'
                              : 'bg-surface-hover text-secondary hover:bg-accent/10 hover:text-accent hover:border-accent/30 border-subtle',
                          )}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {erros.horario && <p className="text-xs font-semibold text-danger">{erros.horario}</p>}
        </div>
      </div>

      {/* 4. Observações */}
      <div className="space-y-1.5">
        <label
          htmlFor="observacao"
          className="flex items-center gap-1.5 text-sm font-bold text-primary"
        >
          <svg
            className="h-4 w-4 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Observações adicionais (Opcional)
        </label>
        <Textarea
          id="observacao"
          rows={3}
          placeholder="Ex: Tenho sensibilidade dental; prefiro atendimento no período da manhã; etc."
          value={dados.observacao}
          onChange={(e) => {
            handleChange('observacao', e.target.value);
          }}
          disabled={carregando}
        />
        {erros.observacao && (
          <p className="text-xs font-semibold text-danger">{erros.observacao}</p>
        )}
      </div>

      {/* 5. Botão de Envio & Reafirmação de Segurança */}
      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          isLoading={carregando}
          disabled={carregando}
          className="w-full hover:-translate-y-0.5"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Solicitar Agendamento
        </Button>

        <p className="text-center text-xs text-muted flex items-center justify-center gap-1.5">
          <svg
            className="h-3.5 w-3.5 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Seus dados estão seguros. Entraremos em contato para confirmar sua reserva.
        </p>
      </div>
    </form>
  );
}
