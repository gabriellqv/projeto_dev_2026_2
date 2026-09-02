import { execSync } from 'node:child_process';

import { beforeAll, afterAll } from 'vitest';

import { prisma } from '../../src/shared/database/prisma.js';

// Setup global para testes de integracao.
// Garante que o banco de testes esteja limpo antes de executar a suite.

beforeAll(() => {
  // Aplica as migrations no banco configurado em DATABASE_URL.
  // Isso evita depender de um banco previamente preparado.
  execSync('npx prisma migrate deploy', {
    cwd: process.cwd(),
    env: { ...process.env, PATH: process.env.PATH },
    stdio: 'ignore',
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
