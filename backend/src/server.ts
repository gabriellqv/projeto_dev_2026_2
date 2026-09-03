import 'dotenv/config';

import { app } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const HOST = process.env.HOST ?? '0.0.0.0';

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor rodando em http://${HOST}:${String(PORT)}`);
});
