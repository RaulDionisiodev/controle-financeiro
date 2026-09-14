import { apiFetch } from './api';

export interface Usuario {
  email: string;
  nome?: string;
}

export function loginComGoogle(credential: string) {
  return apiFetch<Usuario>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function buscarUsuarioLogado() {
  return apiFetch<Usuario>('/auth/me');
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}