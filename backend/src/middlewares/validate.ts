import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export function validarBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const erros = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message,
      }));
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });
    }

    req.body = resultado.data;
    next();
  };
}