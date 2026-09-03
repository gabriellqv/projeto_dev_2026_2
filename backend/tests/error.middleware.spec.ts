import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../src/shared/errors/app-error.js';
import { errorHandler } from '../src/shared/middlewares/error.middleware.js';

// Testes unitarios do middleware central de erros.
// Validam que AppError retorna o status correto e erros inesperados retornam 500.

interface ResponseFake extends Response {
  statusCode: number;
  jsonPayload: unknown;
}

function criarResponseFake(): ResponseFake {
  const response = {
    statusCode: 200,
    jsonPayload: undefined,
    status(this: ResponseFake, code: number) {
      this.statusCode = code;

      return this;
    },
    json(this: ResponseFake, payload: unknown) {
      this.jsonPayload = payload;

      return this;
    },
  } as unknown as ResponseFake;

  return response;
}

describe('errorHandler', () => {
  it('deve retornar o statusCode de um AppError', () => {
    const response = criarResponseFake();

    errorHandler(
      new AppError('Nao autorizado', 401),
      {} as Request,
      response,
      {} as NextFunction,
    );

    expect(response.statusCode).toBe(401);
    expect(response.jsonPayload).toEqual({ message: 'Nao autorizado' });
  });

  it('deve retornar 400 como padrao para AppError sem status', () => {
    const response = criarResponseFake();

    errorHandler(new AppError('Dados invalidos'), {} as Request, response, {} as NextFunction);

    expect(response.statusCode).toBe(400);
    expect(response.jsonPayload).toEqual({ message: 'Dados invalidos' });
  });

  it('deve retornar 500 para erros inesperados', () => {
    const response = criarResponseFake();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('Erro desconhecido'), {} as Request, response, {} as NextFunction);

    expect(response.statusCode).toBe(500);
    expect(response.jsonPayload).toEqual({ message: 'Erro interno no servidor' });

    consoleErrorSpy.mockRestore();
  });
});
