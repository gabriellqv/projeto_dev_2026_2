# Sorriso Mineiro - Sistema de Agendamento Odontológico

Sistema web full stack para agendamento de consultas odontológicas com página pública para captação e painel administrativo protegido para gestão operacional de consultas, status e procedimentos.

Desenvolvido para o teste técnico de **Desenvolvedor(a) Júnior Full Stack** da Mupi Systems.

> **Para justificativas de arquitetura, trade-offs e uso de IA, consulte o [DECISOES.md](./DECISOES.md).**

---

## Deploy Online

A aplicação está disponível publicamente para testes nos seguintes links:

* **Página Pública e Painel Admin:** [https://sorriso-mineiro.vercel.app](https://sorriso-mineiro.vercel.app)
* **Documentação da API (Swagger):** [https://sorriso-mineiro-api.onrender.com/api-docs](https://sorriso-mineiro-api.onrender.com/api-docs)

> **Credenciais de teste do Admin:** `admin@sorrisomineiro.com.br` / `admin123`

---

## Quick Start (Docker Compose)

A forma mais rápida de rodar a aplicação completa (PostgreSQL + Backend + Frontend).

**Pré-requisito:** Docker Engine 24+ e Docker Compose v2 (`docker compose`).

```bash
# 1. Copie o arquivo de variáveis de ambiente e ajuste os valores
cp .env.example .env

# 2. Constrói as imagens e inicia os containers (aplica as migrations automaticamente)
docker compose up --build -d

# 3. Popula os procedimentos e o usuário admin inicial
npm run db:seed:docker
```

> As variáveis `JWT_SECRET` e `ADMIN_PASSWORD` são obrigatórias: o `docker compose up` falha se estiverem ausentes. O `.env.example` já traz valores de exemplo que funcionam.

Acessos disponíveis:
* **Frontend:** [http://localhost](http://localhost)
* **Painel Admin:** [http://localhost/admin](http://localhost/admin) (Login: `admin@sorrisomineiro.com.br` / Senha: `admin123`)
* **Backend API:** [http://localhost:3000](http://localhost:3000)
* **Documentação Swagger:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

> A senha do admin é a definida em `ADMIN_PASSWORD` no `.env` (o valor padrão do `.env.example` é `admin123`). Se você alterar essa variável, use a nova senha no login.

Para derrubar a stack (preservando os dados):

```bash
docker compose down
```

Para derrubar e apagar o banco (começar do zero):

```bash
docker compose down -v
```

---

## Stack Tecnológica

| Camada | Tecnologias |
| --- | --- |
| **Backend** | Node.js 22, Express 4, TypeScript, Prisma 6, PostgreSQL 16, Pino, JWT (`httpOnly`), bcryptjs, Zod |
| **Frontend** | React 19, Vite 6, TypeScript, React Router 7, Tailwind CSS 3, Axios, Lucide Icons |
| **Testes & Qualidade** | Vitest, React Testing Library, ESLint, Prettier, Husky, Commitlint |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, GitHub Actions (CI/CD) |

---

## Execução Local (Sem Docker)

### Pré-requisitos
* **Node.js** 22+ e **npm** 10+
* **PostgreSQL** 16 ativo, com um banco e um usuário criados

### Passo a passo:
```bash
# 1. Instalar dependências
npm install

# 2. Preparar variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edite `backend/.env` e ajuste `DATABASE_URL` com as credenciais reais do seu PostgreSQL. Exemplo:

```
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/odontoagenda?schema=public"
JWT_SECRET="chave-secreta-com-pelo-menos-32-caracteres"
ADMIN_PASSWORD="admin123"
```

> O banco `odontoagenda` precisa existir antes de rodar as migrations. Se preferir não instalar o PostgreSQL, suba apenas o banco via container: `docker compose up -d postgres` (neste caso, use `DATABASE_URL="postgresql://odontoagenda:odontoagenda@localhost:5432/odontoagenda?schema=public"`).

```bash
# 3. Executar migrações do banco e seed inicial
npm run db:migrate -w backend
npm run db:seed -w backend

# 4. Iniciar backend e frontend simultaneamente
npm run dev
```
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3000](http://localhost:3000)
* **Painel Admin:** [http://localhost:5173/admin](http://localhost:5173/admin) (Login: `admin@sorrisomineiro.com.br` / Senha: a definida em `ADMIN_PASSWORD`)

---

## Testes e Qualidade

```bash
npm run test                         # Executa testes unitarios (backend + frontend)
npm run test:integration -w backend  # Executa testes de integracao com PostgreSQL
npm run test:e2e                     # Executa testes ponta a ponta (E2E) com Playwright
npm run lint                         # Executa ESLint no monorepo
npm run type-check                   # Validacao estrita de tipos TypeScript (tsc --noEmit)
npm run format:check                 # Verifica formatacao com Prettier
npm run build                        # Compila backend e frontend para producao
```

---

## Estrutura do Monorepo

```
projeto_dev_2026_2/
├── backend/
│   ├── prisma/             # Schema relacional, migrations e seed inicial
│   ├── src/
│   │   ├── modules/        # Domínios (agendamentos, procedimentos, usuarios, health)
│   │   │   └── [dominio]/  # Routes, Controllers, Services, Repositories e Factories
│   │   ├── shared/         # Middlewares (auth, erro, validação), DTOs e Schemas Zod
│   │   ├── config/         # Logger estruturado (Pino) e Swagger OpenAPI
│   │   └── server.ts       # Bootstrap do servidor Express
│   └── tests/              # Testes unitários e de integração
├── frontend/
│   ├── src/
│   │   ├── pages/          # Landing Page pública, Login e Painel Administrativo
│   │   ├── components/     # Componentes isolados (formulário, pickers, tabelas)
│   │   ├── contexts/       # Gerenciamento de estado (Auth, Tema e Toasts)
│   │   └── services/       # Cliente HTTP Axios e integração tipada
│   └── nginx.conf          # Proxy reverso e headers de segurança
├── docker-compose.yml      # Orquestração de containers (Postgres + Backend + Frontend)
├── DECISOES.md             # Justificativas de arquitetura, trade-offs e uso de IA
└── README.md
```

---

## Documentação da API

A documentação interativa OpenAPI/Swagger de todos os endpoints está disponível em:
* [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
