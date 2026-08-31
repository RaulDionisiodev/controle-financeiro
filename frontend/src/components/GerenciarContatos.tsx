import { useState } from 'react';
import type { Contato } from '../types/contato';

interface GerenciarContatosProps {
  contatos: Contato[];
  onAdicionar: (nome: string, telefone: string) => void;
  onRemover: (id: string) => void;
}

function GerenciarContatos({ contatos, onAdicionar, onRemover }: GerenciarContatosProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;
    onAdicionar(nome.trim(), telefone.replace(/\D/g, ''));
    setNome('');
    setTelefone('');
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdicionar} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Ex: Eu mesmo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Número (com DDI e DDD, só números)
          </label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Ex: 5521999999999"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Adicionar contato
        </button>
      </form>

      {contatos.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          {contatos.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{c.nome} · {c.telefone}</span>
              <button onClick={() => onRemover(c.id)} className="text-red-500 hover:underline">
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GerenciarContatos;