import jwt from 'jsonwebtoken';

export function gerarCookieSessaoTeste(email = 'teste@example.com'): string {
  const token = jwt.sign(
    { email, nome: 'Usuário de Teste' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  return `session=${token}`;
}