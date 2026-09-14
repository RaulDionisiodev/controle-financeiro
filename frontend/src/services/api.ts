const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ erro: 'Erro desconhecido' }));
    throw new Error(erro.erro || `Erro ${resposta.status}`);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return resposta.json();
}