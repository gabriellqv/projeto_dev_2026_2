// Cabecalho da pagina publica com identidade visual da clinica.

export function Header(): React.ReactNode {
  return (
    <header className="bg-teal-600 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold md:text-2xl">OdontoAgenda</h1>
        <p className="hidden text-sm md:block">Clinica Sorriso Mineiro</p>
      </div>
    </header>
  );
}
