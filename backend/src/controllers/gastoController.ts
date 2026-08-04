import type { Request, Response } from 'express';
import { criarGasto } from '../services/gastoService.js';

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