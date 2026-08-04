import { prisma } from '../config/prisma.js';
import { Categoria } from '../generated/prisma/client.js';

interface CriarGastoInput {
  categoria: Categoria;
  data: Date;
  descricao: string;
  valor: number;
  dividido?: boolean;
}

export async function criarGasto(input: CriarGastoInput) {
  if (input.dividido && input.categoria !== Categoria.TRANSPORTE) {
    throw new Error('O campo "dividido" só é válido para a categoria transporte');
  }

  return prisma.gasto.create({
    data: {
      categoria: input.categoria,
      data: input.data,
      descricao: input.descricao,
      valor: input.valor,
      dividido: input.categoria === Categoria.TRANSPORTE ? (input.dividido ?? false) : null,
    },
  });
}