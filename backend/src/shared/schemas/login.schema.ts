import { z } from 'zod';

// Schema usado tanto no endpoint publico de login quanto nas rotas protegidas.

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
