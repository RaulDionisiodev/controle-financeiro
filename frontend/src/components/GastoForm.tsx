import { useState, useEffect } from 'react';
import type { Gasto, GastoInput, Categoria } from '../types/gasto';
import { CATEGORIAS } from '../types/gasto';

interface GastoFormProps {
  gastoParaEditar: Gasto | null;
  onSalvar: (dados: GastoInput) => Promise<void>;
  onCancelar: () => void;
}

function hojeISO(): string {
  return new Date().toISOString().split('T')[0];
}

function GastoForm({ gastoParaEditar, onSalvar, onCancelar }: GastoFormProps) {
  const [categoria, setCategoria] = useState<Categoria>('COMPRAS');
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dividido, setDividido] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (gastoParaEditar) {
      setCategoria(gastoParaEditar.categoria);
      setData(gastoParaEditar.data.split('T')[0]);
      setDescricao(gastoParaEditar.descricao);
      setValor(gastoParaEditar.valor);
      setDividido(gastoParaEditar.dividido ?? false);
    }
  }, [gastoParaEditar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar({
        categoria,
        data,
        descricao,
        valor: Number(valor),
        dividido: categoria === 'TRANSPORTE' ? dividido : undefined,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Categoria)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      {categoria === 'TRANSPORTE' && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={dividido}
            onChange={(e) => setDividido(e.target.checked)}
            className="w-4 h-4"
          />
          Dividir valor (considera 50% no total)
        </label>
      )}

      {erro && <p className="text-red-500 text-sm">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

export default GastoForm;