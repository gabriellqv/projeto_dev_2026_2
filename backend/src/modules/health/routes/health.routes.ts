import { Router } from 'express';

import { HealthController } from '../controllers/health.controller.js';
import { HealthService } from '../services/health.service.js';

// Rota publica de health check.
// Nao depende de autenticacao para permitir monitoramento externo.

const healthService = new HealthService();
const healthController = new HealthController(healthService);

const healthRouter = Router();

healthRouter.get('/', (request, response) => healthController.check(request, response));

export { healthRouter };
