import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { criarGasto, gerarMensagemMensal, gerarMensagemPeriodo } from './gastoService.js';
import { prisma } from '../config/prisma.js';
import { Categoria } from '../generated/prisma/client.js';

describe('gastoService', () => {
  beforeEach(async () => {
    await prisma.gasto.deleteMany();
  });

  afterAll(async () => {
    await prisma.gasto.deleteMany();
    await prisma.$disconnect();
  });

  it('cria um gasto normal sem dividir o valor', async () => {
    const gasto = await criarGasto({
      categoria: Categoria.COMPRAS,
      data: new Date('2026-08-04'),
      descricao: 'Mercado',
      valor: 150,
    });

    expect(gasto.valor.toString()).toBe('150');
    expect(gasto.dividido).toBeNull();
  });

  it('aplica 50% do valor de transporte dividido na mensagem final', async () => {
    await criarGasto({
      categoria: Categoria.TRANSPORTE,
      data: new Date('2026-08-04'),
      descricao: 'Uber',
      valor: 100,
      dividido: true,
    });

    const mensagem = await gerarMensagemMensal(8, 2026);

    expect(mensagem).toContain('R$ 50,00');
    expect(mensagem).toContain('Total do período: R$ 50,00');
  });
});

it('gera mensagem para um período personalizado (não alinhado a um mês)', async () => {
  await criarGasto({
    categoria: Categoria.COMPRAS,
    data: new Date('2026-07-20'),
    descricao: 'Compra em julho',
    valor: 50,
  });
  await criarGasto({
    categoria: Categoria.COMPRAS,
    data: new Date('2026-08-10'),
    descricao: 'Compra em agosto',
    valor: 70,
  });
  await criarGasto({
    categoria: Categoria.COMPRAS,
    data: new Date('2026-08-20'),
    descricao: 'Fora do período',
    valor: 999,
  });

  const mensagem = await gerarMensagemPeriodo(new Date('2026-07-15'), new Date('2026-08-15'));

  expect(mensagem).toContain('15/07/2026 a 15/08/2026');
  expect(mensagem).toContain('Compra em julho');
  expect(mensagem).toContain('Compra em agosto');
  expect(mensagem).not.toContain('Fora do período');
  expect(mensagem).toContain('Total do período: R$ 120,00');
});