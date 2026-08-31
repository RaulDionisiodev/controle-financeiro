import { z } from 'zod';
import { Categoria } from '../generated/prisma/client.js';

export const gastoSchema = z
  .object({
    categoria: z.enum(Categoria).meta({ description: 'Categoria do gasto' }),
    data: z.coerce.date().meta({ description: 'Data do gasto', example: '2026-08-04' }),
    descricao: z.string().trim().min(1).meta({ description: 'Descrição do gasto', example: 'Mercado' }),
    valor: z.number().positive().meta({ description: 'Valor do gasto', example: 150.5 }),
    dividido: z
      .boolean()
      .optional()
      .meta({ description: 'Válido apenas para transporte: divide o valor em 50%' }),
  })
  .superRefine((dados, ctx) => {
    if (dados.dividido && dados.categoria !== Categoria.TRANSPORTE) {
      ctx.addIssue({
        code: 'custom',
        message: 'O campo "dividido" só é válido para a categoria transporte',
        path: ['dividido'],
      });
    }
  })
  .meta({ id: 'Gasto', description: 'Dados de um gasto financeiro' });

  export const periodoSchema = z
  .object({
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
  })
  .superRefine((dados, ctx) => {
    if (dados.dataFim < dados.dataInicio) {
      ctx.addIssue({
        code: 'custom',
        message: '"dataFim" deve ser maior ou igual a "dataInicio"',
        path: ['dataFim'],
      });
    }
  });

export type GastoInput = z.infer<typeof gastoSchema>;