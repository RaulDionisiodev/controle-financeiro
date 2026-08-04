import type { Request, Response } from 'express';
import { criarGasto, listarGastos, gerarMensagemMensal, deletarGasto, atualizarGasto } from '../services/gastoService.js';

export async function criar(req: Request, res: Response) {
  try {
    const gasto = await criarGasto(req.body);
    return res.status(201).json(gasto);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ erro: error.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

export async function listar(req: Request, res: Response) {
  const mes = Number(req.query.mes);
  const ano = Number(req.query.ano);

  if (!mes || !ano || mes < 1 || mes > 12) {
    return res.status(400).json({ erro: 'Informe "mes" (1-12) e "ano" válidos via query string' });
  }

  const gastos = await listarGastos(mes, ano);
  return res.json(gastos);
}

export async function mensagem(req: Request, res: Response) {
  const mes = Number(req.query.mes);
  const ano = Number(req.query.ano);

  if (!mes || !ano || mes < 1 || mes > 12) {
    return res.status(400).json({ erro: 'Informe "mes" (1-12) e "ano" válidos via query string' });
  }

  const texto = await gerarMensagemMensal(mes, ano);
  return res.json({ mensagem: texto });
}

export async function atualizar(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ erro: 'Parâmetro "id" inválido' });
  }

  try {
    const gasto = await atualizarGasto(id, req.body);
    return res.json(gasto);
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Gasto não encontrado' ? 404 : 400;
      return res.status(status).json({ erro: error.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

export async function deletar(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ erro: 'Parâmetro "id" inválido' });
  }

  try {
    await deletarGasto(id);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Gasto não encontrado' ? 404 : 400;
      return res.status(status).json({ erro: error.message });
    }
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}