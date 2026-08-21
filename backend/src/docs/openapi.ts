import { createDocument } from 'zod-openapi';
import { z } from 'zod';
import { gastoSchema } from '../schemas/gastoSchema.js';

const erroSchema = z.object({
  erro: z.string(),
  detalhes: z
    .array(z.object({ campo: z.string(), mensagem: z.string() }))
    .optional(),
});

const mesAnoQuery = z.object({
  mes: z.coerce.number().min(1).max(12),
  ano: z.coerce.number(),
});

const idPath = z.object({
  id: z.string(),
});

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'API de Controle Financeiro',
    version: '1.0.0',
    description:
      'API para lançar gastos por categoria e gerar mensagem mensal formatada para WhatsApp.',
  },
  paths: {
    '/gastos': {
      post: {
        summary: 'Criar um gasto',
        requestBody: {
          content: { 'application/json': { schema: gastoSchema } },
        },
        responses: {
          '201': { description: 'Gasto criado', content: { 'application/json': { schema: gastoSchema } } },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: erroSchema } } },
        },
      },
      get: {
        summary: 'Listar gastos de um mês',
        requestParams: { query: mesAnoQuery },
        responses: {
          '200': { description: 'Lista de gastos', content: { 'application/json': { schema: z.array(gastoSchema) } } },
          '400': { description: 'Parâmetros inválidos', content: { 'application/json': { schema: erroSchema } } },
        },
      },
    },
    '/gastos/{id}': {
      put: {
        summary: 'Atualizar um gasto',
        requestParams: { path: idPath },
        requestBody: {
          content: { 'application/json': { schema: gastoSchema } },
        },
        responses: {
          '200': { description: 'Gasto atualizado', content: { 'application/json': { schema: gastoSchema } } },
          '404': { description: 'Gasto não encontrado', content: { 'application/json': { schema: erroSchema } } },
        },
      },
      delete: {
        summary: 'Excluir um gasto',
        requestParams: { path: idPath },
        responses: {
          '204': { description: 'Gasto excluído' },
          '404': { description: 'Gasto não encontrado', content: { 'application/json': { schema: erroSchema } } },
        },
      },
    },
    '/gastos/mensagem': {
      get: {
        summary: 'Gerar mensagem mensal formatada',
        requestParams: { query: mesAnoQuery },
        responses: {
          '200': {
            description: 'Mensagem gerada',
            content: { 'application/json': { schema: z.object({ mensagem: z.string() }) } },
          },
          '400': { description: 'Parâmetros inválidos', content: { 'application/json': { schema: erroSchema } } },
        },
      },
    },
  },
});