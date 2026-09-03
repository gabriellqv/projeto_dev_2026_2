import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

// Seed inicial com dados de exemplo para desenvolvimento.
// Nao incluir dados reais de producao neste arquivo.

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Seed idempotente: so cria procedimentos se ainda nao existirem.
  // Usa titulo como chave natural para evitar duplicatas em reinicializacoes.
  const procedimentosExistentes = await prisma.procedimento.findMany({
    select: { titulo: true },
  });
  const titulosExistentes = new Set(procedimentosExistentes.map((p) => p.titulo));

  const procedimentosParaCriar = [
    {
      titulo: 'Limpeza e Profilaxia',
      ativa: true,
      preco: 150.0,
      duracaoMinutos: 45,
    },
    {
      titulo: 'Clareamento Dental',
      ativa: true,
      preco: 800.0,
      duracaoMinutos: 60,
    },
    {
      titulo: 'Restauracao de Resina',
      ativa: true,
      preco: 250.0,
      duracaoMinutos: 50,
    },
    {
      titulo: 'Tratamento de Canal',
      ativa: true,
      preco: 1200.0,
      duracaoMinutos: 90,
    },
  ].filter((p) => !titulosExistentes.has(p.titulo));

  if (procedimentosParaCriar.length > 0) {
    await prisma.procedimento.createMany({
      data: procedimentosParaCriar,
    });
  }

  // Senha padrao para ambiente de desenvolvimento.
  // Trocar antes de subir para producao.
  const senhaHash = bcryptjs.hashSync('admin123', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@sorrisomineiro.com.br' },
    update: {},
    create: {
      email: 'admin@sorrisomineiro.com.br',
      nome: 'Administrador',
      senha: senhaHash,
      admin: true,
    },
  });
}

main()
  .catch((erro: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Erro ao executar seed:', erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
