import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verificarTokenGoogle(credential: string) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Token do Google inválido');
  }

  return { email: payload.email, nome: payload.name };
}

export function emailPermitido(email: string): boolean {
  const permitidos = (process.env.EMAILS_PERMITIDOS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  return permitidos.includes(email.toLowerCase());
}