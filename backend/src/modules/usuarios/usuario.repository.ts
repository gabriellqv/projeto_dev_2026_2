import type { Usuario, Prisma } from '@prisma/client';

// Interface do repositorio de usuarios.
// Permite trocar a fonte de autenticacao sem alterar os services.

export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  criar(dados: Prisma.UsuarioCreateInput): Promise<Usuario>;
}
