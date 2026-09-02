/**
 * Componente raiz da aplicação.
 *
 * Inicialmente renderiza um placeholder enquanto as rotas e páginas
 * são implementadas nas próximas tarefas.
 */
export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">Sorriso Mineiro</h1>
          <p className="mt-1 text-sm font-medium text-primary-500">OdontoAgenda</p>
          <p className="mt-2 text-slate-600">Sistema de agendamentos da clínica</p>
        </div>
      </div>
    </main>
  );
}
