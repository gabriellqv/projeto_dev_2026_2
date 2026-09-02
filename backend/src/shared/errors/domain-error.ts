// Erro de dominio padrao do sistema.
// Usado pelos services para sinalizar violacoes de regra de negocio.

export class DomainError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'DomainError';
  }
}
