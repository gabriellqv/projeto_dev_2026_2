import type { Usuario } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { AppError } from '../../../shared/errors/app-error.js';
import { loginSchema, type LoginInput } from '../../../shared/schemas/login.schema.js';
import type { UsuarioRepository } from '../usuario.repository.js';

// Service de autenticacao responsavel por validar credenciais e gerar tokens JWT.
// Mantem a logica de login fora dos controllers e independente do framework web.

export interface AuthPayload {
  id: string;
  email: string;
  admin: boolean;
}

export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async login(input: LoginInput): Promise<{ usuario: Usuario; token: string }> {
    const parsed = loginSchema.safeParse(input);

    if (!parsed.success) {
      throw new AppError('Email e senha sao obrigatorios', 400);
    }

    const { email, senha } = parsed.data;
    const usuario = await this.usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      throw new AppError('Credenciais invalidas', 401);
    }

    const senhaValida = await bcryptjs.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new AppError('Credenciais invalidas', 401);
    }

    const token = this.gerarToken({
      id: usuario.id,
      email: usuario.email,
      admin: usuario.admin,
    });

    return { usuario, token };
  }

  private gerarToken(payload: AuthPayload): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError('JWT_SECRET nao configurado', 500);
    }

    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }
}
