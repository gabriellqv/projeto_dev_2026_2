import type { Request, Response } from 'express';

import type { HealthService } from '../services/health.service.js';

// Controller publico do health check.
// Retorna 200 se o banco estiver acessivel e 503 caso contrario.

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  async check(_request: Request, response: Response): Promise<void> {
    const resultado = await this.healthService.verificar();
    const statusCode = resultado.database === 'connected' ? 200 : 503;

    response.status(statusCode).json(resultado);
  }
}
