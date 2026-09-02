import type { Usuario } from '@prisma/client';

// Interface do repositorio de usuarios.
// Permite trocar a fonte de autenticacao sem alterar os services.

export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  criar(dados: UsuarioData): Promise<Usuario>;
}

// Tipo compartilhado para criacao sem campos gerenciados pelo banco.
export type UsuarioData = Pick<Usuario, 'email' | 'nome' | 'senha' | 'admin'>;
