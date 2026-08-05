import { z } from 'zod';
import { Categoria } from '../generated/prisma/client.js';

export const gastoSchema = z
  .object({
    categoria: z.enum(Categoria),
    data: z.coerce.date(),
    descricao: z.string().trim().min(1, 'Descrição é obrigatória'),
    valor: z.number().positive('Valor deve ser maior que zero'),
    dividido: z.boolean().optional(),
  })
  .superRefine((dados, ctx) => {
    if (dados.dividido && dados.categoria !== Categoria.TRANSPORTE) {
      ctx.addIssue({
        code: 'custom',
        message: 'O campo "dividido" só é válido para a categoria transporte',
        path: ['dividido'],
      });
    }
  });

export type GastoInput = z.infer<typeof gastoSchema>;