import { z } from 'zod';

// Schemas de validacao do formulario publico de agendamento.
// Garante que os dados estejam no formato esperado antes do envio a API.

const dataAtual = new Date();
const hoje = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());

export const agendamentoSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no maximo 100 caracteres'),
  email: z.string().email('Informe um e-mail valido').max(100, 'E-mail muito longo'),
  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Informe um telefone valido com DDD e 9 digitos')
    .optional()
    .or(z.literal('')),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida')
    .refine((valor) => {
      const data = new Date(valor);
      return !Number.isNaN(data.getTime()) && data >= hoje;
    }, 'A data deve ser hoje ou uma data futura'),
  horario: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, 'Informe um horario valido'),
  observacao: z.string().max(500, 'A observacao deve ter no maximo 500 caracteres').optional(),
  procedimentoId: z.string().uuid('Selecione um procedimento'),
});

export type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

// Helpers para formatacao e validacao de campos do formulario.
export const formatarTelefone = (valor: string): string => {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
};

export const gerarHorarios = (): string[] => {
  const horarios: string[] = [];

  for (let hora = 8; hora < 18; hora += 1) {
    for (const minuto of [0, 30]) {
      horarios.push(`${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`);
    }
  }

  return horarios;
};

export const formatarDataExibicao = (dataIso: string): string => {
  const data = new Date(dataIso);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
