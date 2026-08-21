import type { Gasto } from '../types/gasto';

const CATEGORIA_INFO: Record<Gasto['categoria'], { emoji: string; label: string }> = {
  COMPRAS: { emoji: '🛒', label: 'Compras' },
  SERVICOS: { emoji: '🔧', label: 'Serviços' },
  PARCELAMENTOS: { emoji: '💳', label: 'Parcelamentos' },
  TRANSPORTE: { emoji: '🚗', label: 'Transporte' },
};

function formatarMoeda(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataIso: string): string {
  return new Date(dataIso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

interface GastoCardProps {
  gasto: Gasto;
  onEditar: (gasto: Gasto) => void;
  onExcluir: (id: string) => void;
}

function GastoCard({ gasto, onEditar, onExcluir }: GastoCardProps) {
  const { emoji, label } = CATEGORIA_INFO[gasto.categoria];

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="font-medium text-slate-800 truncate">{gasto.descricao}</p>
          <p className="text-sm text-slate-500">
            {label} · {formatarData(gasto.data)}
            {gasto.dividido && ' · Dividido'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-slate-800">{formatarMoeda(gasto.valor)}</span>
        <button
          onClick={() => onEditar(gasto)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          aria-label="Editar"
        >
          ✎
        </button>
        <button
          onClick={() => onExcluir(gasto.id)}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
          aria-label="Excluir"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default GastoCard;