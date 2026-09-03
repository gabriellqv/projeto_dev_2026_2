import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AdminLayout } from '../components/AdminLayout';
import { StatusActionSelect, StatusFilterSelect } from '../components/CustomSelect';
import { Alert } from '../components/ui/Alert';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { AgendaGridSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { useContadorAnimado } from '../hooks/useContadorAnimado';
import { cn } from '../lib/cn';
import { formatarDataExibicao } from '../schemas/agendamento.schema';
import {
  adminApi,
  type AgendamentoAdmin,
  type Procedimento,
  type StatusAgendamento,
} from '../services/admin.service';

// Grade padrão de horários clínicos da Sorriso Mineiro (08:00 às 19:00 com intervalo)
const HORARIOS_CLINICOS_MANHA = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
];

const HORARIOS_CLINICOS_TARDE = [
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
];

const TODOS_HORARIOS_SLOTS = [...HORARIOS_CLINICOS_MANHA, ...HORARIOS_CLINICOS_TARDE];

function formatarParaIsoDate(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${String(ano)}-${mes}-${dia}`;
}

function extrairDataYMD(dataIso: string): string {
  if (!dataIso) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataIso)) return dataIso;
  const partes = dataIso.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(partes)) return partes;
  const d = new Date(dataIso);
  if (Number.isNaN(d.getTime())) return dataIso.slice(0, 10);
  const ano = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(d.getUTCDate()).padStart(2, '0');
  return `${String(ano)}-${mes}-${dia}`;
}

function verificarSlotPassado(dataIso: string, horarioSlot: string): boolean {
  try {
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    const [hora, minuto] = horarioSlot.split(':').map(Number);
    const dataSlot = new Date(ano, mes - 1, dia, hora, minuto, 0);
    const agora = new Date();
    return dataSlot.getTime() < agora.getTime();
  } catch {
    return false;
  }
}

export function AgendaPage(): React.ReactNode {
  const toast = useToast();
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Data selecionada na agenda (padrão: hoje)
  const [dataSelecionada, setDataSelecionada] = useState<string>(() =>
    formatarParaIsoDate(new Date()),
  );
  const [modoVisualizacao, setModoVisualizacao] = useState<'dia' | 'semana'>('dia');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  // Carrega todos os agendamentos e procedimentos
  const carregarDados = useCallback(async (isRefresh = false): Promise<void> => {
    if (isRefresh) setRecarregando(true);
    else setCarregando(true);

    setErro(null);

    try {
      const [resAgendamentos, resProcedimentos] = await Promise.all([
        adminApi.listarAgendamentos({
          pagina: 1,
          limite: 100,
        }),
        adminApi.listarProcedimentos().catch(() => []),
      ]);

      setAgendamentos(resAgendamentos.agendamentos);
      setProcedimentos(resProcedimentos);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao carregar dados da agenda.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  // Alterar status diretamente pela agenda
  const handleStatusChange = async (id: string, novoStatus: StatusAgendamento): Promise<void> => {
    try {
      await adminApi.atualizarStatus(id, novoStatus);
      setAgendamentos((anterior) =>
        anterior.map((ag) => (ag.id === id ? { ...ag, status: novoStatus } : ag)),
      );
      toast.success(`Status da consulta alterado para ${novoStatus}!`);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao atualizar status.';
      setErro(mensagem);
      toast.error(mensagem);
    }
  };

  // Navegação de dias
  const mudarDia = (deltaDias: number): void => {
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    dataObj.setDate(dataObj.getDate() + deltaDias);
    setDataSelecionada(formatarParaIsoDate(dataObj));
  };

  const irParaHoje = (): void => {
    setDataSelecionada(formatarParaIsoDate(new Date()));
  };

  // Título legível da data selecionada
  const dataExtenso = useMemo(() => {
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia, 12, 0, 0);

    const hojeIso = formatarParaIsoDate(new Date());
    const isHoje = dataSelecionada === hojeIso;

    const textoFormatado = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dataObj);

    return {
      texto: textoFormatado.charAt(0).toUpperCase() + textoFormatado.slice(1),
      isHoje,
    };
  }, [dataSelecionada]);

  // Todos os agendamentos na data selecionada (para contagens reais e mapa completo)
  const todosAgendamentosDoDia = useMemo(() => {
    return agendamentos.filter((a) => {
      const dataIso = extrairDataYMD(a.data);
      return dataIso === dataSelecionada;
    });
  }, [agendamentos, dataSelecionada]);

  // Mapa de agendamentos por horário para a visualização diária
  const mapaHorarios = useMemo(() => {
    const mapa = new Map<string, AgendamentoAdmin[]>();

    todosAgendamentosDoDia.forEach((item) => {
      const lista = mapa.get(item.horario) || [];
      lista.push(item);
      mapa.set(item.horario, lista);
    });

    return mapa;
  }, [todosAgendamentosDoDia]);

  // Métricas gerais de toda a clínica para os cards principais
  const metricasGerais = useMemo(() => {
    return {
      totalGeral: agendamentos.length,
      pendentes: agendamentos.filter((a) => a.status === 'PENDENTE').length,
      confirmados: agendamentos.filter((a) => a.status === 'CONFIRMADO').length,
      atendidos: agendamentos.filter((a) => a.status === 'ATENDIDO').length,
      cancelados: agendamentos.filter((a) => a.status === 'CANCELADO').length,
    };
  }, [agendamentos]);

  // Métricas específicas do dia selecionado
  const metricasDia = useMemo(() => {
    const total = todosAgendamentosDoDia.length;
    const confirmados = todosAgendamentosDoDia.filter((a) => a.status === 'CONFIRMADO').length;
    const pendentes = todosAgendamentosDoDia.filter((a) => a.status === 'PENDENTE').length;
    const atendidos = todosAgendamentosDoDia.filter((a) => a.status === 'ATENDIDO').length;

    // Soma do tempo em minutos de todos os procedimentos do dia
    const tempoTotalMinutos = todosAgendamentosDoDia.reduce((acumulado, ag) => {
      const proc = ag.procedimento || procedimentos.find((p) => p.id === ag.procedimentoId);
      return acumulado + (proc?.duracaoMinutos || 30);
    }, 0);

    const horas = Math.floor(tempoTotalMinutos / 60);
    const minutos = tempoTotalMinutos % 60;
    const tempoFormatado =
      horas > 0
        ? `${String(horas)}h ${minutos > 0 ? `${String(minutos)}min` : ''}`
        : `${String(minutos)}min`;

    return {
      total,
      confirmados,
      pendentes,
      atendidos,
      tempoFormatado: total > 0 ? tempoFormatado : '0 min',
      tempoTotalMinutos,
    };
  }, [todosAgendamentosDoDia, procedimentos]);

  // Contadores animados com a mesma curva de easing suave da Dashboard
  const animTotal = useContadorAnimado(metricasGerais.totalGeral, { duracaoMs: 1200 });
  const animPendentes = useContadorAnimado(metricasGerais.pendentes, { duracaoMs: 1000 });
  const animConfirmados = useContadorAnimado(metricasGerais.confirmados, { duracaoMs: 1000 });
  const animAtendidos = useContadorAnimado(metricasGerais.atendidos, { duracaoMs: 1000 });
  const animTotalDia = useContadorAnimado(metricasDia.total, { duracaoMs: 800 });

  // Dias da semana para a Visão Semanal
  const diasDaSemana = useMemo(() => {
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);

    // Ajusta para segunda-feira da semana atual
    const diaDaSemana = dataObj.getDay(); // 0 = Dom, 1 = Seg, ...
    const diferencaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
    const segundaFeira = new Date(dataObj);
    segundaFeira.setDate(dataObj.getDate() + diferencaSegunda);

    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dataDia = new Date(segundaFeira);
      dataDia.setDate(segundaFeira.getDate() + i);
      const iso = formatarParaIsoDate(dataDia);

      const agendamentosNesteDia = agendamentos.filter((a) => extrairDataYMD(a.data) === iso);

      dias.push({
        dataIso: iso,
        dataObj: dataDia,
        nomeDia: dataDia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        diaMes: dataDia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        agendamentos: agendamentosNesteDia,
        isSelecionado: iso === dataSelecionada,
        isHoje: iso === formatarParaIsoDate(new Date()),
      });
    }

    return dias;
  }, [dataSelecionada, agendamentos]);

  const KPI_CARDS = [
    {
      id: 'total',
      label: 'Total Geral',
      value: animTotal,
      desc: `${String(metricasDia.total)} agendado(s) no dia selecionado`,
      status: '',
      ativo: filtroStatus === '',
      cor: 'accent' as const,
      icone: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      id: 'PENDENTE',
      label: 'Pendentes',
      value: animPendentes,
      desc: 'Aguardando resposta',
      status: 'PENDENTE',
      ativo: filtroStatus === 'PENDENTE',
      cor: 'warning' as const,
      ping: metricasGerais.pendentes > 0,
      icone: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'CONFIRMADO',
      label: 'Confirmados',
      value: animConfirmados,
      desc: 'Consultas agendadas',
      status: 'CONFIRMADO',
      ativo: filtroStatus === 'CONFIRMADO',
      cor: 'success' as const,
      icone: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'ATENDIDO',
      label: 'Atendidos',
      value: animAtendidos,
      desc: 'Procedimentos realizados',
      status: 'ATENDIDO',
      ativo: filtroStatus === 'ATENDIDO',
      cor: 'info' as const,
      icone: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  const ICONE_ATUALIZAR = (
    <svg
      className={cn('h-4 w-4', recarregando && 'animate-spin-reverse')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  const ICONE_LISTA = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );

  const ICONE_DIA = (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const ICONE_SEMANA = (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const ICONE_ANTERIOR = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const ICONE_PROXIMO = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );

  const ICONE_RELOGIO = (
    <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <AdminLayout
      titulo="Agenda Clínica"
      subtitulo="Visualização de grade horária diária e semanal com controle de slots e atendimentos."
      acoes={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void carregarDados(true)}
            disabled={carregando || recarregando}
            title="Recarregar agenda"
          >
            {ICONE_ATUALIZAR}
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <Button asChild variant="primary" size="sm" className="gap-1.5">
            <Link to="/admin">
              {ICONE_LISTA}
              <span className="hidden sm:inline">Visão Tabela</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {erro && <Alert variant="error">{erro}</Alert>}

        {/* Barra de Controles: Navegador de Data + Alternador de Visualização */}
        <Card variant="outlined" className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Navegação de Data */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center rounded-2xl border border-default bg-inset p-1">
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    mudarDia(-1);
                  }}
                  title="Dia anterior"
                >
                  {ICONE_ANTERIOR}
                </IconButton>

                <Button
                  type="button"
                  variant={dataExtenso.isHoje ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={irParaHoje}
                >
                  Hoje
                </Button>

                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    mudarDia(1);
                  }}
                  title="Próximo dia"
                >
                  {ICONE_PROXIMO}
                </IconButton>
              </div>

              <Input
                type="date"
                value={dataSelecionada}
                onChange={(e) => {
                  if (e.target.value) setDataSelecionada(e.target.value);
                }}
                className="w-auto max-w-[170px] px-3.5 py-2 text-xs font-bold"
              />

              <div className="hidden xl:flex items-center gap-2 pl-2">
                <span className="text-sm font-black text-primary">{dataExtenso.texto}</span>
                {dataExtenso.isHoje && <Badge variant="success">Dia Atual</Badge>}
              </div>
            </div>

            {/* Alternadores de Modo e Filtro */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-2xl border border-default bg-inset p-1">
                <Button
                  type="button"
                  variant={modoVisualizacao === 'dia' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setModoVisualizacao('dia');
                  }}
                >
                  {ICONE_DIA}
                  Grade Diária
                </Button>

                <Button
                  type="button"
                  variant={modoVisualizacao === 'semana' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setModoVisualizacao('semana');
                  }}
                >
                  {ICONE_SEMANA}
                  Visão Semanal
                </Button>
              </div>

              <StatusFilterSelect
                value={filtroStatus}
                onChange={(novo) => {
                  setFiltroStatus(novo);
                }}
              />
            </div>
          </div>
        </Card>

        {/* 4 Cards de Métricas Principais (KPIs) com Animação e Design Idênticos à Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {KPI_CARDS.map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => {
                setFiltroStatus(kpi.status === filtroStatus ? '' : kpi.status);
              }}
              className={cn(
                'flex flex-col justify-between rounded-3xl p-4 sm:p-5 text-left transition-all border shadow-sm',
                kpi.ativo
                  ? 'ring-2 bg-surface-hover shadow-md'
                  : 'bg-surface border-default hover:border-hover hover:shadow-card',
                kpi.ativo && kpi.cor === 'accent' && 'border-accent ring-accent/20',
                kpi.ativo && kpi.cor === 'warning' && 'border-warning ring-warning/20',
                kpi.ativo && kpi.cor === 'success' && 'border-success ring-success/20',
                kpi.ativo && kpi.cor === 'info' && 'border-info ring-info/20',
                !kpi.ativo && 'border-default',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider',
                      !kpi.ativo && 'text-muted',
                      kpi.ativo && kpi.cor === 'accent' && 'text-accent',
                      kpi.ativo && kpi.cor === 'warning' && 'text-amber-600 dark:text-amber-400',
                      kpi.ativo &&
                        kpi.cor === 'success' &&
                        'text-emerald-600 dark:text-emerald-400',
                      kpi.ativo && kpi.cor === 'info' && 'text-cyan-600 dark:text-cyan-400',
                    )}
                  >
                    {kpi.label}
                  </span>
                  {kpi.ping && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
                    kpi.ativo && kpi.cor === 'accent' && 'bg-accent text-white',
                    kpi.ativo && kpi.cor === 'warning' && 'bg-amber-500 text-white',
                    kpi.ativo && kpi.cor === 'success' && 'bg-emerald-500 text-white',
                    kpi.ativo && kpi.cor === 'info' && 'bg-cyan-500 text-white',
                    !kpi.ativo && kpi.cor === 'accent' && 'bg-accent/10 text-accent',
                    !kpi.ativo &&
                      kpi.cor === 'warning' &&
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    !kpi.ativo &&
                      kpi.cor === 'success' &&
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    !kpi.ativo &&
                      kpi.cor === 'info' &&
                      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                  )}
                >
                  {kpi.icone}
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-primary tabular-nums">
                  {kpi.value}
                </span>
                <p
                  className={cn(
                    'text-2xs font-medium mt-0.5',
                    !kpi.ativo && 'text-muted',
                    kpi.ativo && kpi.cor === 'accent' && 'text-accent font-bold',
                    kpi.ativo &&
                      kpi.cor === 'warning' &&
                      'text-amber-600 dark:text-amber-400 font-bold',
                    kpi.ativo &&
                      kpi.cor === 'success' &&
                      'text-emerald-600 dark:text-emerald-400 font-bold',
                    kpi.ativo && kpi.cor === 'info' && 'text-cyan-600 dark:text-cyan-400 font-bold',
                  )}
                >
                  {kpi.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* VISÃO 1: GRADE DIÁRIA DE HORÁRIOS */}
        {modoVisualizacao === 'dia' && (
          <Card variant="elevated" className="p-5 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-subtle pb-4">
              <div>
                <h2 className="text-base font-black text-primary flex items-center gap-2">
                  <span>Grade de Atendimento do Dia</span>
                  <Badge variant="neutral">{animTotalDia} atendimento(s)</Badge>
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Horários estruturados das 08:00 às 19:00 com ações e contato direto.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-success">
                  <span className="h-2 w-2 rounded-full bg-success" /> Confirmado
                </span>
                <span className="flex items-center gap-1.5 text-warning">
                  <span className="h-2 w-2 rounded-full bg-warning" /> Pendente
                </span>
                <span className="flex items-center gap-1.5 text-info">
                  <span className="h-2 w-2 rounded-full bg-info" /> Atendido
                </span>
              </div>
            </div>

            {/* Lista dos Slots de Horários */}
            {carregando && agendamentos.length === 0 ? (
              <AgendaGridSkeleton count={8} />
            ) : (
              <div className="space-y-3">
                {TODOS_HORARIOS_SLOTS.map((slot) => {
                  const agendamentosNesteSlot = mapaHorarios.get(slot) || [];
                  const ocupado = agendamentosNesteSlot.length > 0;
                  const isPassado = verificarSlotPassado(dataSelecionada, slot);
                  const isPrimeiroTarde = slot === '13:00';

                  return (
                    <div key={slot}>
                      {/* Divisor do Intervalo de Almoço */}
                      {isPrimeiroTarde && (
                        <div className="my-6 flex items-center justify-center gap-3 py-2 border-y border-dashed border-subtle">
                          <span className="flex items-center gap-2 text-xs font-bold text-muted">
                            {ICONE_RELOGIO}
                            Intervalo de Almoço da Equipe (12:00 às 13:00)
                          </span>
                        </div>
                      )}

                      <div
                        className={cn(
                          'flex flex-col md:flex-row md:items-stretch gap-3 rounded-2xl p-3 sm:p-4 transition-all',
                          ocupado
                            ? 'bg-inset/80 border border-default'
                            : 'border border-dashed border-subtle hover:border-default hover:bg-inset/40',
                        )}
                      >
                        {/* Horário Slot */}
                        <div className="flex md:flex-col items-center justify-between md:justify-center md:w-24 shrink-0 pr-0 md:pr-4 md:border-r border-subtle">
                          <span className="text-base font-black text-primary tabular-nums">
                            {slot}
                          </span>
                          <span
                            className={cn(
                              'text-3xs font-bold uppercase tracking-wider',
                              ocupado && 'text-accent',
                              isPassado && !ocupado && 'text-muted',
                              !ocupado && !isPassado && 'text-success',
                            )}
                          >
                            {ocupado
                              ? `${String(agendamentosNesteSlot.length)} ${
                                  agendamentosNesteSlot.length === 1 ? 'consulta' : 'consultas'
                                }`
                              : isPassado
                                ? 'Encerrado'
                                : 'Livre'}
                          </span>
                        </div>

                        {/* Conteúdo do Slot */}
                        <div className="flex-1">
                          {ocupado ? (
                            <div className="space-y-2">
                              {agendamentosNesteSlot.map((ag) => {
                                const coincideComFiltro = filtroStatus
                                  ? ag.status === filtroStatus
                                  : true;
                                const foneLimpo = ag.telefone?.replace(/\D/g, '');
                                const proc =
                                  ag.procedimento ||
                                  procedimentos.find((p) => p.id === ag.procedimentoId);

                                return (
                                  <div
                                    key={ag.id}
                                    className={cn(
                                      'rounded-2xl p-4 shadow-sm border border-default bg-surface transition-all hover:shadow-card',
                                      ag.status === 'CONFIRMADO' && 'border-l-4 border-l-success',
                                      ag.status === 'PENDENTE' && 'border-l-4 border-l-warning',
                                      ag.status === 'ATENDIDO' && 'border-l-4 border-l-info',
                                      ag.status === 'CANCELADO' &&
                                        'border-l-4 border-l-danger bg-surface/60',
                                      !coincideComFiltro &&
                                        'opacity-40 grayscale-[25%] hover:opacity-100 hover:grayscale-0',
                                    )}
                                  >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                      {/* Info do Paciente */}
                                      <div className="flex items-center gap-3 min-w-0">
                                        <Avatar name={ag.nome} size="md" />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-primary truncate">
                                              {ag.nome}
                                            </h3>
                                            <span className="hidden sm:inline-block text-xs text-muted">
                                              • {ag.email}
                                            </span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary mt-0.5">
                                            <span className="font-semibold text-accent">
                                              {proc?.titulo ?? 'Consulta Odontológica'}
                                            </span>
                                            {proc?.duracaoMinutos && (
                                              <Badge variant="neutral" className="gap-1">
                                                <svg
                                                  className="h-3 w-3"
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
                                                {proc.duracaoMinutos} min
                                              </Badge>
                                            )}
                                            {proc?.preco && (
                                              <span className="text-primary font-medium">
                                                R$ {Number(proc.preco).toFixed(2).replace('.', ',')}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Ações Rápidas no Card */}
                                      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-subtle">
                                        {/* WhatsApp */}
                                        {foneLimpo && (
                                          <a
                                            href={`https://wa.me/55${foneLimpo}?text=${encodeURIComponent(
                                              `Olá ${ag.nome}, aqui é da Clínica Odontológica Sorriso Mineiro! Confirmamos sua consulta para ${formatarDataExibicao(
                                                ag.data,
                                              )} às ${ag.horario}. Qualquer dúvida estamos à disposição!`,
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-button bg-success px-2.5 py-1.5 text-xs font-bold text-success-text hover:bg-emerald-500 hover:text-white transition-all"
                                            title={`Conversar com ${ag.nome} no WhatsApp`}
                                          >
                                            <svg
                                              className="h-3.5 w-3.5"
                                              fill="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.128-.519-1.834-.757-3.018-2.627-3.11-2.748-.09-.12-0.738-.983-.738-1.873 0-.89.468-1.328.636-1.508.168-.18.366-.225.486-.225.12 0 .24.002.345.006.11.006.26-.041.408.312.152.366.52 1.267.565 1.359.045.092.075.2.015.32-.06.12-.09.195-.18.3-.09.105-.19.234-.27.315-.09.09-.185.187-.08.367.105.18.468.772 1.004 1.249.69.614 1.272.805 1.452.895.18.09.285.075.39-.045s.45-.525.57-.705.24-.15.405-.09c.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84z" />
                                            </svg>
                                            <span>WhatsApp</span>
                                          </a>
                                        )}

                                        {/* Alterador de Status Inline */}
                                        <StatusActionSelect
                                          value={ag.status as StatusAgendamento}
                                          onChange={(novoStatus) =>
                                            void handleStatusChange(ag.id, novoStatus)
                                          }
                                        />

                                        {/* Link para Detalhes */}
                                        <Link
                                          to={`/admin/agendamentos/${ag.id}`}
                                          className="rounded-button border border-default bg-surface px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all"
                                        >
                                          Ver Ficha
                                        </Link>
                                      </div>
                                    </div>

                                    {/* Observações do Paciente */}
                                    {ag.observacao && (
                                      <div className="mt-2.5 rounded-xl bg-inset p-2 text-xs text-secondary border border-subtle">
                                        <strong className="text-primary">Nota: </strong>
                                        {ag.observacao}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : isPassado ? (
                            <div className="flex items-center justify-between py-1 text-xs text-muted">
                              <span>Nenhum agendamento registrado</span>
                              <Badge variant="neutral" className="gap-1">
                                <svg
                                  className="h-3 w-3"
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
                                Horário Passado
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between py-1 text-xs text-muted">
                              <span>Horário disponível para atendimento</span>
                              <Badge variant="success">✓ Disponível</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* VISÃO 2: GRADE SEMANAL (7 DIAS) */}
        {modoVisualizacao === 'semana' && (
          <Card variant="elevated" className="p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-subtle pb-4">
              <div>
                <h2 className="text-base font-black text-primary">Visão Semanal de Agendamentos</h2>
                <p className="text-xs text-secondary mt-0.5">
                  Acompanhe a distribuição de pacientes ao longo dos 7 dias da semana.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {diasDaSemana.map((dia) => {
                return (
                  <Card
                    key={dia.dataIso}
                    variant={dia.isSelecionado ? 'outlined' : 'default'}
                    className={cn(
                      'cursor-pointer p-3.5 transition-all',
                      dia.isSelecionado && 'border-accent ring-2 ring-accent/20',
                    )}
                    onClick={() => {
                      setDataSelecionada(dia.dataIso);
                      setModoVisualizacao('dia');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-muted">{dia.nomeDia}</span>
                      {dia.isHoje && (
                        <span className="rounded-full bg-success h-2 w-2" title="Hoje" />
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-lg font-black text-primary">{dia.diaMes}</span>
                      <Badge
                        variant={dia.agendamentos.length > 0 ? 'primary' : 'neutral'}
                        className="text-3xs"
                      >
                        {dia.agendamentos.length}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 min-h-[140px]">
                      {dia.agendamentos.length === 0 ? (
                        <EmptyState
                          title=""
                          description="Sem consultas"
                          className="py-0"
                          icon={<div className="h-4 w-4" />}
                        />
                      ) : (
                        dia.agendamentos.slice(0, 4).map((ag) => (
                          <div
                            key={ag.id}
                            className="rounded-xl border border-subtle bg-inset p-2 text-left text-xs transition-colors hover:bg-surface-hover"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary truncate max-w-[90px]">
                                {ag.nome.split(' ')[0]}
                              </span>
                              <span className="text-3xs font-bold text-muted tabular-nums">
                                {ag.horario}
                              </span>
                            </div>
                            <span className="block text-3xs text-accent truncate">
                              {ag.procedimento?.titulo ?? 'Consulta'}
                            </span>
                          </div>
                        ))
                      )}

                      {dia.agendamentos.length > 4 && (
                        <span className="block text-center text-3xs font-bold text-muted">
                          + {dia.agendamentos.length - 4} mais
                        </span>
                      )}
                    </div>

                    <Button type="button" variant="secondary" size="sm" className="mt-3 w-full">
                      Abrir Grade
                    </Button>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
