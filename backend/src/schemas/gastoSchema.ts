import { z } from 'zod';
import { Categoria, SentidoViagem, GrupoGasto } from '../generated/prisma/client.js';

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
    sentido: z.enum(SentidoViagem).optional().meta({ description: 'Válido apenas para transporte: ida ou volta' }),
    divisor: z.number().int().min(2).max(20).optional().meta({
      description: 'Válido apenas para transporte: número de pessoas que dividem o gasto (inclui quem pagou)',
      example: 3,
    }),
    grupo: z.enum(GrupoGasto).optional().meta({
      description: 'Válido apenas para transporte: grupo que define a seção no relatório',
    }),  
  })
  .superRefine((dados, ctx) => {
    if (dados.categoria !== Categoria.TRANSPORTE) {
      for (const campo of ['sentido', 'divisor', 'grupo'] as const) {
        if (dados[campo] !== undefined) {
          ctx.addIssue({
            code: 'custom',
            message: `O campo "${campo}" só é válido para a categoria transporte`,
            path: [campo],
          });
        }
      }
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