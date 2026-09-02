import cors from 'cors';
import type { Application } from 'express';
import express from 'express';
import helmet from 'helmet';

import { agendamentoAdminRouter } from './modules/agendamentos/routes/agendamento-admin.routes.js';
import { agendamentoPublicRouter } from './modules/agendamentos/routes/agendamento-public.routes.js';
import { procedimentoAdminRouter } from './modules/procedimentos/routes/procedimento-admin.routes.js';
import { procedimentoPublicRouter } from './modules/procedimentos/routes/procedimento-public.routes.js';
import { authRouter } from './modules/usuarios/routes/auth.routes.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

// Aplicacao Express configurada com middlewares globais e rotas.
// Este e o composition root do backend.

export const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check simples para validar se a API esta no ar.
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

// Rotas publicas.
app.use('/api/procedimentos', procedimentoPublicRouter);
app.use('/api/agendamentos', agendamentoPublicRouter);
app.use('/api/auth', authRouter);

// Rotas administrativas.
app.use('/api/admin/procedimentos', procedimentoAdminRouter);
app.use('/api/admin/agendamentos', agendamentoAdminRouter);

// Middleware central de tratamento de erros.
app.use(errorHandler);
