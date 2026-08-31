import { useState, useEffect } from 'react';
import type { Contato } from '../types/contato';

const CHAVE_STORAGE = 'controle-financeiro:contatos';

function carregarContatos(): Contato[] {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

export function useContatos() {
  const [contatos, setContatos] = useState<Contato[]>(carregarContatos);

  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(contatos));
  }, [contatos]);

  function adicionarContato(nome: string, telefone: string) {
    const novo: Contato = { id: crypto.randomUUID(), nome, telefone };
    setContatos((atual) => [...atual, novo]);
  }

  function removerContato(id: string) {
    setContatos((atual) => atual.filter((c) => c.id !== id));
  }

  return { contatos, adicionarContato, removerContato };
}