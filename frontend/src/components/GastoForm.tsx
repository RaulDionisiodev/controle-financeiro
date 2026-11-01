import { useState, useEffect } from 'react';
import type { Gasto, GastoInput, Categoria, Sentido } from '../types/gasto';
import { CATEGORIAS, SENTIDOS } from '../types/gasto';
import { hojeISO } from '../utils/data';
interface GastoFormProps {
  gastoParaEditar: Gasto | null;
  onSalvar: (dados: GastoInput) => Promise<void>;
  onCancelar: () => void;
}

function GastoForm({ gastoParaEditar, onSalvar, onCancelar }: GastoFormProps) {
  const [categoria, setCategoria] = useState<Categoria>('COMPRAS');
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dividido, setDividido] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sentido, setSentido] = useState<Sentido | ''>('');

  useEffect(() => {
    if (gastoParaEditar) {
      setCategoria(gastoParaEditar.categoria);
      setData(gastoParaEditar.data.split('T')[0]);
      setDescricao(gastoParaEditar.descricao);
      setValor(gastoParaEditar.valor);
      setDividido(gastoParaEditar.dividido ?? false);
      setSentido(gastoParaEditar.sentido ?? '');
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
        sentido: categoria === 'TRANSPORTE' && sentido ? sentido : undefined,
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
  <>
    <div>
      <span className="block text-sm font-medium text-slate-700 mb-1">Sentido</span>
      <div className="flex gap-2">
        {SENTIDOS.map((s) => (
          <button
            key={s.valor}
            type="button"
            aria-pressed={sentido === s.valor}
            onClick={() => setSentido(sentido === s.valor ? '' : s.valor)}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${
              sentido === s.valor
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>

    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={dividido}
        onChange={(e) => setDividido(e.target.checked)}
        className="w-4 h-4"
      />
      Dividir valor (considera 50% no total)
    </label>
  </>
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