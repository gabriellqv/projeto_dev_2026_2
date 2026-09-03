import cors from 'cors';
import type { Application } from 'express';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { swaggerDocument } from './config/swagger.js';
import { agendamentoAdminRouter } from './modules/agendamentos/routes/agendamento-admin.routes.js';
import { agendamentoPublicRouter } from './modules/agendamentos/routes/agendamento-public.routes.js';
import { healthRouter } from './modules/health/routes/health.routes.js';
import { procedimentoAdminRouter } from './modules/procedimentos/routes/procedimento-admin.routes.js';
import { procedimentoPublicRouter } from './modules/procedimentos/routes/procedimento-public.routes.js';
import { authRouter } from './modules/usuarios/routes/auth.routes.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

// Aplicacao Express configurada com middlewares globais e rotas.
// Este e o composition root do backend.

export const app: Application = express();

// Helmet adiciona headers de seguranca basicos.
app.use(helmet());

// CORS limitado as origens configuradas via ambiente.
// Padrao: frontend local em desenvolvimento.
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

// Documentacao interativa da API em /api-docs.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check verifica tambem a conectividade com o PostgreSQL.
app.use('/api/health', healthRouter);

// Rotas publicas.
app.use('/api/procedimentos', procedimentoPublicRouter);
app.use('/api/agendamentos', agendamentoPublicRouter);
app.use('/api/auth', authRouter);

// Rotas administrativas.
app.use('/api/admin/procedimentos', procedimentoAdminRouter);
app.use('/api/admin/agendamentos', agendamentoAdminRouter);

// Middleware central de tratamento de erros.
app.use(errorHandler);
