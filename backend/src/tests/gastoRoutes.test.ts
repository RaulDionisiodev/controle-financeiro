import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';
import { gerarCookieSessaoTeste } from './authHelper.js';

const cookieAutenticado = gerarCookieSessaoTeste();

describe('Rotas de Gastos', () => {
  beforeEach(async () => {
    await prisma.gasto.deleteMany();
  });

  afterAll(async () => {
    await prisma.gasto.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /gastos', () => {
    it('cria um gasto válido e retorna 201', async () => {
      const resposta = await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'COMPRAS',
        data: '2026-08-04',
        descricao: 'Mercado',
        valor: 150,
      });

      expect(resposta.status).toBe(201);
      expect(resposta.body.descricao).toBe('Mercado');
      expect(resposta.body.dividido).toBeNull();
    });

    it('retorna 400 quando a categoria é inválida', async () => {
      const resposta = await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'INVALIDA',
        data: '2026-08-04',
        descricao: 'Teste',
        valor: 100,
      });

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('Dados inválidos');
    });

    it('retorna 400 quando "dividido" é usado fora da categoria transporte', async () => {
      const resposta = await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'COMPRAS',
        data: '2026-08-04',
        descricao: 'Mercado',
        valor: 100,
        dividido: true,
      });

      expect(resposta.status).toBe(400);
      expect(
        resposta.body.detalhes.some((d: { campo: string }) => d.campo === 'dividido')
      ).toBe(true);
    });
  });

  describe('GET /gastos', () => {
    it('lista os gastos do mês informado', async () => {
      await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'COMPRAS',
        data: '2026-08-04',
        descricao: 'Mercado',
        valor: 150,
      });

      const resposta = await request(app).get('/gastos')
      .set('Cookie', cookieAutenticado)
      .query({ mes: 8, ano: 2026 });

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveLength(1);
    });

    it('retorna 400 quando "mes" ou "ano" não são informados', async () => {
      const resposta = await request(app).get('/gastos').set('Cookie', cookieAutenticado);

      expect(resposta.status).toBe(400);
    });
  });

  describe('PUT /gastos/:id', () => {
    it('atualiza um gasto existente e retorna 200', async () => {
      const criado = await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'COMPRAS',
        data: '2026-08-04',
        descricao: 'Mercado',
        valor: 150,
      });

      const resposta = await request(app).put(`/gastos/${criado.body.id}`)
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'COMPRAS',
        data: '2026-08-04',
        descricao: 'Mercado - corrigido',
        valor: 180,
      });

      expect(resposta.status).toBe(200);
      expect(resposta.body.descricao).toBe('Mercado - corrigido');
    });

    it('retorna 404 ao tentar atualizar um gasto inexistente', async () => {
      const resposta = await request(app)
        .put('/gastos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', cookieAutenticado)
        .send({
          categoria: 'COMPRAS',
          data: '2026-08-04',
          descricao: 'Mercado',
          valor: 150,
        });

      expect(resposta.status).toBe(404);
    });
  });

  describe('DELETE /gastos/:id', () => {
    it('exclui um gasto existente e retorna 204', async () => {
      const criado = await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'COMPRAS',
        data: '2026-08-04',
        descricao: 'Mercado',
        valor: 150,
      });

      const resposta = await request(app).delete(`/gastos/${criado.body.id}`)
      .set('Cookie', cookieAutenticado);

      expect(resposta.status).toBe(204);
    });

    it('retorna 404 ao tentar excluir um gasto inexistente', async () => {
      const resposta = await request(app).delete(
        '/gastos/00000000-0000-0000-0000-000000000000'
      ).set('Cookie', cookieAutenticado);

      expect(resposta.status).toBe(404);
    });
  });

  describe('GET /gastos/mensagem', () => {
    it('gera a mensagem final com a regra do transporte dividido aplicada', async () => {
      await request(app).post('/gastos')
      .set('Cookie', cookieAutenticado)
      .send({
        categoria: 'TRANSPORTE',
        data: '2026-08-04',
        descricao: 'Uber',
        valor: 100,
        dividido: true,
      });

      const resposta = await request(app)
        .get('/gastos/mensagem')
        .set('Cookie', cookieAutenticado)
        .query({ mes: 8, ano: 2026 });

      expect(resposta.status).toBe(200);
      expect(resposta.body.mensagem).toContain('R$ 50,00');
    });
  });

  describe('Autenticação', () => {
    it('retorna 401 ao acessar rota de gastos sem sessão', async () => {
      const resposta = await request(app).get('/gastos').query({ mes: 8, ano: 2026 });
      expect(resposta.status).toBe(401);
    });
  });
});