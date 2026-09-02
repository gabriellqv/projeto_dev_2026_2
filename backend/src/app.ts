import cors from 'cors';
import type { Application } from 'express';
import express from 'express';
import helmet from 'helmet';

/**
 * Aplicação Express configurada com middlewares globais.
 *
 * Este é o composition root do backend: todas as dependências concretas
 * serão instanciadas aqui nas próximas tarefas.
 */
export const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * Health check simples para validar se a API está no ar.
 */
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});
