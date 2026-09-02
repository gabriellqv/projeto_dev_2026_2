import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

// Seed inicial com dados de exemplo para desenvolvimento.
// Nao incluir dados reais de producao neste arquivo.

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.procedimento.createMany({
    data: [
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
    ],
  });

  // Senha padrao para ambiente de desenvolvimento.
  // Trocar antes de subir para producao.
  const senhaHash = bcryptjs.hashSync('admin123', 10);

  await prisma.usuario.create({
    data: {
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
