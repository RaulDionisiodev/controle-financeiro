import { apiFetch } from './api';
import type { Gasto, GastoInput } from '../types/gasto';

export function listarGastos(mes: number, ano: number) {
  return apiFetch<Gasto[]>(`/gastos?mes=${mes}&ano=${ano}`);
}

export function criarGasto(dados: GastoInput) {
  return apiFetch<Gasto>('/gastos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarGasto(id: string, dados: GastoInput) {
  return apiFetch<Gasto>(`/gastos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirGasto(id: string) {
  return apiFetch<void>(`/gastos/${id}`, { method: 'DELETE' });
}

export function gerarMensagem(mes: number, ano: number) {
  return apiFetch<{ mensagem: string }>(`/gastos/mensagem?mes=${mes}&ano=${ano}`);
}