const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface SeletorMesAnoProps {
  mes: number;
  ano: number;
  onMesAnterior: () => void;
  onProximoMes: () => void;
}

function SeletorMesAno({ mes, ano, onMesAnterior, onProximoMes }: SeletorMesAnoProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
      <button
        onClick={onMesAnterior}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        aria-label="Mês anterior"
      >
        ←
      </button>
      <span className="font-semibold text-slate-800">
        {MESES[mes - 1]} de {ano}
      </span>
      <button
        onClick={onProximoMes}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        aria-label="Próximo mês"
      >
        →
      </button>
    </div>
  );
}

export default SeletorMesAno;