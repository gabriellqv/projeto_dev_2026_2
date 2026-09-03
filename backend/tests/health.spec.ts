import request from 'supertest';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { app } from '../src/app';
import { prisma } from '../src/shared/database/prisma.js';

// Testes do health check.
// Verificam resposta quando o banco esta acessivel e quando falha.

describe('Health check', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar status ok quando o banco esta conectado', async () => {
    vi.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([{ '1': 1 }]);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'connected' });
  });

  it('deve retornar erro quando o banco esta desconectado', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Falha na conexao'));

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'disconnected' });
  });
});
