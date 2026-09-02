import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app';

describe('Health check', () => {
  it('deve retornar status ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
