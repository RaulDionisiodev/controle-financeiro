import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session;

  if (typeof token !== 'string') {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; nome?: string };
    req.usuario = { email: payload.email, nome: payload.nome };
    next();
  } catch {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
  }
}