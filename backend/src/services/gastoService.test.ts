import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { criarGasto, gerarMensagemMensal } from './gastoService.js';
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
    expect(mensagem).toContain('Total do mês: R$ 50,00');
  });
});