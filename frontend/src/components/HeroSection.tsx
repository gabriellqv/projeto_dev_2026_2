// Secao de apresentacao da clinica na pagina publica.

export function HeroSection(): React.ReactNode {
  return (
    <section className="bg-teal-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-teal-800 md:text-4xl">
          Seu sorriso em boas maos
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-700">
          Agende sua consulta de forma rapida e pratica. Escolha o procedimento, preencha seus dados
          e aguarde a confirmacao da nossa equipe.
        </p>
      </div>
    </section>
  );
}
