import 'dotenv/config';

import { app } from './app.js';
import { logger } from './config/logger.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const HOST = process.env.HOST ?? '0.0.0.0';

app.listen(PORT, HOST, () => {
  // Usa logger estruturado em vez de console.log para facilitar observabilidade.
  logger.info(`Servidor rodando em http://${HOST}:${String(PORT)}`);
});
