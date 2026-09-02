import { execSync } from 'node:child_process';

import { beforeAll, afterAll } from 'vitest';

import { prisma } from '../../src/shared/database/prisma.js';

// Setup global para testes de integracao.
// Aplica migrations e popula dados iniciais no banco configurado em DATABASE_URL.

beforeAll(() => {
  // Aplica as migrations no banco configurado em DATABASE_URL.
  execSync('npx prisma migrate deploy', {
    cwd: process.cwd(),
    env: { ...process.env, PATH: process.env.PATH },
    stdio: 'ignore',
  });

  // Popula o admin e os procedimentos padrao para os testes.
  // O seed e idempotente: nao duplica registros existentes.
  execSync('npx prisma db seed', {
    cwd: process.cwd(),
    env: { ...process.env, PATH: process.env.PATH },
    stdio: 'ignore',
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
