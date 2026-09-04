import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { AdminLayout } from '../components/AdminLayout';
import { StatusActionSelect } from '../components/CustomSelect';
import { Alert } from '../components/ui/Alert';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { useContadorAnimado } from '../hooks/useContadorAnimado';
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../lib/cn';
import { formatarDataExibicao } from '../schemas/agendamento.schema';
import {
  adminApi,
  type AgendamentoAdmin,
  type Procedimento,
  type StatusAgendamento,
} from '../services/admin.service';

export function DashboardPage(): React.ReactNode {
  const toast = useToast();
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca, 350);
  const [carregando, setCarregando] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [contagensGlobais, setContagensGlobais] = useState({
    total: 0,
    pendentes: 0,
    confirmados: 0,
    atendidos: 0,
    cancelados: 0,
  });

  const carregarDados = useCallback(
    async (isRefresh = false): Promise<void> => {
      if (isRefresh) setRecarregando(true);
      else setCarregando(true);

      setErro(null);

      try {
        const [resAgendamentos, resTodosAgendamentos, resProcedimentos] = await Promise.all([
          adminApi.listarAgendamentos({
            pagina,
            limite,
            status: statusFiltro || undefined,
            busca: buscaDebounced || undefined,
          }),
          adminApi.listarAgendamentos({ pagina: 1, limite: 100 }),
          adminApi.listarProcedimentos().catch(() => []),
        ]);

        setAgendamentos(resAgendamentos.agendamentos);
        setTotal(resAgendamentos.total);
        setProcedimentos(resProcedimentos);

        const todos = resTodosAgendamentos.agendamentos;
        setContagensGlobais({
          total: resTodosAgendamentos.total,
          pendentes: todos.filter((a) => a.status === 'PENDENTE').length,
          confirmados: todos.filter((a) => a.status === 'CONFIRMADO').length,
          atendidos: todos.filter((a) => a.status === 'ATENDIDO').length,
          cancelados: todos.filter((a) => a.status === 'CANCELADO').length,
        });
      } catch (error) {
        const mensagem =
          error instanceof Error ? error.message : 'Erro ao carregar dados da dashboard.';
        setErro(mensagem);
      } finally {
        setCarregando(false);
        setRecarregando(false);
      }
    },
    [pagina, statusFiltro, buscaDebounced, limite],
  );

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const handleStatusChange = async (id: string, novoStatus: StatusAgendamento): Promise<void> => {
    try {
      await adminApi.atualizarStatus(id, novoStatus);
      setAgendamentos((anterior) =>
        anterior.map((agendamento) =>
          agendamento.id === id ? { ...agendamento, status: novoStatus } : agendamento,
        ),
      );
      toast.success(`Status atualizado para ${novoStatus}!`);
      void carregarDados(false);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao atualizar status.';
      setErro(mensagem);
      toast.error(mensagem);
    }
  };

  const metricas = useMemo(() => {
    const procedimentosAtivos = procedimentos.filter((p) => p.ativa).length;

    return {
      pendentes: contagensGlobais.pendentes,
      confirmados: contagensGlobais.confirmados,
      atendidos: contagensGlobais.atendidos,
      cancelados: contagensGlobais.cancelados,
      totalGeral: contagensGlobais.total,
      procedimentosAtivos,
      totalVisivel: agendamentos.length,
    };
  }, [contagensGlobais, procedimentos, agendamentos.length]);

  const animTotal = useContadorAnimado(metricas.totalGeral, { duracaoMs: 1200 });
  const animPendentes = useContadorAnimado(metricas.pendentes, { duracaoMs: 1000 });
  const animConfirmados = useContadorAnimado(metricas.confirmados, { duracaoMs: 1000 });
  const animAtendidos = useContadorAnimado(metricas.atendidos, { duracaoMs: 1000 });
  const animProcedimentos = useContadorAnimado(metricas.procedimentosAtivos, { duracaoMs: 1000 });

  const [animarBarra, setAnimarBarra] = useState(false);

  useEffect(() => {
    setAnimarBarra(false);
    const timer = setTimeout(() => {
      setAnimarBarra(true);
    }, 80);
    return () => {
      clearTimeout(timer);
    };
  }, [metricas.totalGeral, recarregando]);

  const exportarCSV = (): void => {
    if (agendamentos.length === 0) return;

    const cabecalho = [
      'ID',
      'Paciente',
      'Email',
      'Telefone',
      'Data',
      'Horario',
      'Procedimento',
      'Status',
    ];
    const linhas = agendamentos.map((item) => [
      item.id,
      `"${item.nome.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${item.telefone ?? ''}"`,
      formatarDataExibicao(item.data),
      item.horario,
      `"${item.procedimento?.titulo ?? 'Consulta'}"`,
      item.status,
    ]);

    const conteudo = [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `agendamentos_sorriso_mineiro_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório CSV exportado com sucesso!');
  };

  const totalPaginas = Math.ceil(total / limite);

  const dataHojeFormatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const kpis = [
    {
      id: '',
      label: 'Total',
      value: animTotal,
      description: 'Registros cadastrados',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      accent: 'accent',
    },
    {
      id: 'PENDENTE',
      label: 'Pendentes',
      value: animPendentes,
      description: 'Aguardando resposta',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      accent: 'warning',
      ping: metricas.pendentes > 0,
    },
    {
      id: 'CONFIRMADO',
      label: 'Confirmados',
      value: animConfirmados,
      description: 'Consultas agendadas',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      accent: 'success',
    },
    {
      id: 'ATENDIDO',
      label: 'Atendidos',
      value: animAtendidos,
      description: 'Procedimentos realizados',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      accent: 'info',
    },
  ] as const;

  const tabs = [
    { id: '', label: 'Todos', contagem: metricas.totalGeral },
    { id: 'PENDENTE', label: 'Pendentes', contagem: metricas.pendentes },
    { id: 'CONFIRMADO', label: 'Confirmados', contagem: metricas.confirmados },
    { id: 'ATENDIDO', label: 'Atendidos', contagem: metricas.atendidos },
    { id: 'CANCELADO', label: 'Cancelados', contagem: metricas.cancelados },
  ];

  return (
    <AdminLayout
      titulo="Visão Geral & Atendimentos"
      subtitulo="Acompanhe os agendamentos, métricas clínicas e status dos pacientes em tempo real."
      acoes={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          disabled={carregando || recarregando}
          onClick={() => void carregarDados(true)}
          title="Recarregar agendamentos"
        >
          <svg
            className={cn('h-4 w-4 text-accent', recarregando && 'animate-spin-reverse')}
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
          <span className="hidden md:inline">Atualizar</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {erro && (
          <Alert
            variant="error"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          >
            {erro}
          </Alert>
        )}

        {/* Banner */}
        <Card variant="gradient" className="relative overflow-hidden p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/15 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Painel Clínico Inteligente
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Olá, Administrador 👋
              </h2>
              <p className="mt-1 text-2xs font-medium text-white/90 sm:text-xs">
                {capitalize(dataHojeFormatada)} • Clínica Sorriso Mineiro em operação normal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <Link to="/admin/procedimentos">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Novo Procedimento
                </Link>
              </Button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-button bg-white px-4 py-2.5 text-2xs font-bold text-accent hover:bg-surface transition-all shadow-md"
              >
                Ver Página
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute right-40 -top-20 h-48 w-48 rounded-full bg-primary-accent/20 blur-2xl" />
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5 sm:gap-4">
          {kpis.map((kpi) => {
            const ativo = statusFiltro === kpi.id;
            return (
              <button
                key={kpi.id}
                type="button"
                onClick={() => {
                  setStatusFiltro(kpi.id);
                  setPagina(1);
                }}
                className={cn(
                  'flex flex-col justify-between rounded-card p-4 text-left transition-all border shadow-sm sm:p-5',
                  ativo
                    ? 'bg-accent/10 border-accent ring-2 ring-accent/20'
                    : 'bg-surface border-default hover:border-hover hover:shadow-md',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted">
                    {kpi.label}
                  </span>
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-2xl',
                      kpi.accent === 'accent' && 'bg-accent/10 text-accent',
                      kpi.accent === 'warning' &&
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      kpi.accent === 'success' &&
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      kpi.accent === 'info' && 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                    )}
                  >
                    {kpi.icon}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black tabular-nums text-primary sm:text-3xl">
                      {kpi.value}
                    </span>
                    {'ping' in kpi && kpi.ping && (
                      <span className="h-2 w-2 rounded-full bg-warning animate-ping" />
                    )}
                  </div>
                  <p className="text-3xs text-muted font-medium mt-0.5">{kpi.description}</p>
                </div>
              </button>
            );
          })}

          <Link
            to="/admin/procedimentos"
            className="col-span-2 flex flex-col justify-between rounded-card border border-default bg-surface p-4 text-left transition-all shadow-sm hover:border-accent hover:shadow-md sm:p-5 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-muted">
                Catálogo
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-inset text-secondary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black tabular-nums text-primary sm:text-3xl">
                {animProcedimentos}
              </span>
              <p className="text-3xs text-muted font-medium mt-0.5">Serviços ativos na página</p>
            </div>
          </Link>
        </div>

        {/* Barra de distribuição */}
        {metricas.totalGeral > 0 && (
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between text-2xs font-bold text-secondary">
              <span>Distribuição Geral de Status da Clínica</span>
              <span className="font-normal text-muted">
                {metricas.totalGeral} agendamentos registrados
              </span>
            </div>

            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-inset p-0.5 shadow-inner">
              {[
                {
                  value: metricas.pendentes,
                  color: 'from-amber-400 to-amber-500',
                  rounded: 'rounded-l-full',
                },
                {
                  value: metricas.confirmados,
                  color: 'from-emerald-400 to-emerald-500',
                  rounded: '',
                },
                { value: metricas.atendidos, color: 'from-cyan-400 to-cyan-500', rounded: '' },
                {
                  value: metricas.cancelados,
                  color: 'from-rose-400 to-rose-500',
                  rounded: 'rounded-r-full',
                },
              ].map((segmento, idx) => {
                const width =
                  metricas.totalGeral > 0 ? (segmento.value / metricas.totalGeral) * 100 : 0;
                const label = ['Pendentes', 'Confirmados', 'Atendidos', 'Cancelados'][idx];
                return segmento.value > 0 ? (
                  <div
                    key={idx}
                    style={{ width: animarBarra ? `${String(width)}%` : '0%' }}
                    className={cn(
                      'h-full bg-gradient-to-r transition-all duration-1000 ease-out',
                      segmento.color,
                      segmento.rounded,
                    )}
                    title={`${label}: ${String(segmento.value)} (${width.toFixed(1)}%)`}
                  />
                ) : null;
              })}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-4 text-2xs font-semibold text-secondary">
              <LegendItem color="bg-amber-500" label={`Pendente (${String(metricas.pendentes)})`} />
              <LegendItem
                color="bg-emerald-500"
                label={`Confirmado (${String(metricas.confirmados)})`}
              />
              <LegendItem color="bg-cyan-500" label={`Atendido (${String(metricas.atendidos)})`} />
              <LegendItem
                color="bg-rose-500"
                label={`Cancelado (${String(metricas.cancelados)})`}
              />
            </div>
          </Card>
        )}

        {/* Tabela */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 pb-6 border-b border-default lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {tabs.map((tab) => {
                const isAtivo = statusFiltro === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFiltro(tab.id);
                      setPagina(1);
                    }}
                    className={cn(
                      'group flex items-center gap-2 whitespace-nowrap rounded-2xl px-3.5 py-2 text-2xs font-bold transition-all',
                      isAtivo
                        ? 'bg-accent text-white shadow-md shadow-accent/25'
                        : 'bg-inset text-secondary hover:bg-surface-hover hover:text-primary',
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-3xs font-black transition-colors',
                        isAtivo
                          ? 'bg-white/20 text-white'
                          : 'bg-default text-muted group-hover:text-accent',
                      )}
                    >
                      {tab.contagem}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar paciente ou e-mail..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPagina(1);
                  }}
                  className="w-full rounded-2xl border border-default bg-surface py-2 pl-10 pr-9 text-sm text-primary placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
                />
                {busca && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      setBusca('');
                      setPagina(1);
                    }}
                    aria-label="Limpar busca"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </IconButton>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={agendamentos.length === 0}
                onClick={exportarCSV}
                title="Exportar listagem atual para planilha CSV"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="mt-6">
            {carregando && agendamentos.length === 0 ? (
              <TableSkeleton rows={5} cols={6} />
            ) : agendamentos.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                title="Nenhum agendamento encontrado"
                description={
                  busca || statusFiltro
                    ? 'Não foram encontrados agendamentos para os filtros aplicados. Tente limpar a busca.'
                    : 'Nenhum paciente realizou agendamento ainda. Os novos registros enviados pelo formulário público aparecerão aqui.'
                }
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-default">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b border-default bg-inset">
                      <tr>
                        <th className="px-4 py-3.5 text-2xs font-bold uppercase tracking-wider text-secondary">
                          Paciente
                        </th>
                        <th className="px-4 py-3.5 text-2xs font-bold uppercase tracking-wider text-secondary">
                          Procedimento
                        </th>
                        <th className="px-4 py-3.5 text-2xs font-bold uppercase tracking-wider text-secondary">
                          Data & Horário
                        </th>
                        <th className="px-4 py-3.5 text-2xs font-bold uppercase tracking-wider text-secondary">
                          Status
                        </th>
                        <th className="px-4 py-3.5 text-right text-2xs font-bold uppercase tracking-wider text-secondary">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default bg-surface">
                      {agendamentos.map((agendamento) => {
                        const foneLimpo = agendamento.telefone?.replace(/\D/g, '');
                        return (
                          <tr
                            key={agendamento.id}
                            className="group transition-colors hover:bg-inset/50"
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={agendamento.nome} />
                                <div className="min-w-0">
                                  <div className="font-bold text-primary truncate">
                                    {agendamento.nome}
                                  </div>
                                  <div className="flex items-center gap-2 truncate text-2xs text-muted">
                                    <span>{agendamento.email}</span>
                                    {agendamento.telefone && (
                                      <>
                                        <span>•</span>
                                        <a
                                          href={`https://wa.me/55${foneLimpo ?? ''}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                          title="Abrir WhatsApp"
                                        >
                                          {agendamento.telefone}
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="inline-flex flex-col">
                                <span className="font-semibold text-primary">
                                  {agendamento.procedimento?.titulo ?? 'Consulta Odontológica'}
                                </span>
                                {agendamento.procedimento?.preco && (
                                  <span className="text-2xs text-muted">
                                    R$ {parseFloat(agendamento.procedimento.preco).toFixed(2)} •{' '}
                                    {agendamento.procedimento.duracaoMinutos} min
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-bold text-primary">
                                  {formatarDataExibicao(agendamento.data)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-2xs font-semibold text-accent">
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
                                  {agendamento.horario}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <StatusActionSelect
                                value={agendamento.status as StatusAgendamento}
                                onChange={(novoStatus) =>
                                  void handleStatusChange(agendamento.id, novoStatus)
                                }
                              />
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Link
                                to={`/admin/agendamentos/${agendamento.id}`}
                                className="inline-flex items-center gap-1 rounded-xl bg-inset px-3 py-1.5 text-2xs font-bold text-accent transition-all hover:bg-accent hover:text-white"
                              >
                                Detalhes
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
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-default pt-4 sm:flex-row">
                <span className="text-2xs font-medium text-muted">
                  Mostrando página <strong className="text-primary">{pagina}</strong> de{' '}
                  <strong className="text-primary">{totalPaginas}</strong> ({total} registros no
                  total)
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                    disabled={pagina === 1 || carregando}
                    onClick={() => {
                      setPagina((p) => Math.max(1, p - 1));
                    }}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Anterior
                  </Button>

                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setPagina(num);
                        }}
                        className={cn(
                          'h-7 w-7 rounded-lg text-2xs font-bold transition-all',
                          num === pagina
                            ? 'bg-accent text-white shadow-sm'
                            : 'text-secondary hover:bg-inset',
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                    disabled={pagina === totalPaginas || carregando}
                    onClick={() => {
                      setPagina((p) => Math.min(totalPaginas, p + 1));
                    }}
                  >
                    Próximo
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

function LegendItem({ color, label }: { color: string; label: string }): React.ReactNode {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
      <span>{label}</span>
    </div>
  );
}
