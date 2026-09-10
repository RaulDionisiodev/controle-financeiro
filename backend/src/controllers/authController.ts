import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verificarTokenGoogle, emailPermitido } from '../services/authService.js';
import { logger } from '../config/logger.js';
import { Sentry } from '../config/sentry.js';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NOME = 'session';

export async function loginGoogle(req: Request, res: Response) {
  const { credential } = req.body;

  if (typeof credential !== 'string') {
    return res.status(400).json({ erro: 'Credential ausente' });
  }

  try {
    const { email, nome } = await verificarTokenGoogle(credential);

    if (!emailPermitido(email)) {
      logger.warn({ email }, 'Tentativa de login com e-mail não autorizado');
      Sentry.logger.warn('Tentativa de login com e-mail não autorizado', { email });
      return res.status(403).json({ erro: 'E-mail não autorizado a acessar esta aplicação' });
    }

    const token = jwt.sign({ email, nome }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie(COOKIE_NOME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info({ email }, 'Login realizado');
    Sentry.logger.info('Login realizado', { email });

    return res.json({ email, nome });
  } catch (error) {
    Sentry.captureException(error);
    return res.status(401).json({ erro: 'Falha na autenticação com o Google' });
  }
}

export function me(req: Request, res: Response) {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  return res.json(req.usuario);
}

export function logout(req: Request, res: Response) {
  res.clearCookie(COOKIE_NOME);
  return res.status(204).send();
}