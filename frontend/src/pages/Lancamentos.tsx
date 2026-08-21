import { useEffect, useState, useCallback } from 'react';
import { useMesAno } from '../hooks/useMesAno';
import { listarGastos, excluirGasto, criarGasto, atualizarGasto } from '../services/gastoService';
import type { Gasto, GastoInput } from '../types/gasto';
import SeletorMesAno from '../components/SeletorMesAno';
import GastoCard from '../components/GastoCard';
import Modal from '../components/Modal';
import GastoForm from '../components/GastoForm';

function Lancamentos() {
  const { mes, ano, mesAnterior, proximoMes } = useMesAno();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);

  const carregarGastos = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarGastos(mes, ano);
      setGastos(dados);
    } catch {
      setErro('Não foi possível carregar os gastos.');
    } finally {
      setCarregando(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    carregarGastos();
  }, [carregarGastos]);

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;
    await excluirGasto(id);
    carregarGastos();
  }

  function handleNovoGasto() {
    setGastoEditando(null);
    setModalAberto(true);
  }

  function handleEditar(gasto: Gasto) {
    setGastoEditando(gasto);
    setModalAberto(true);
  }

  async function handleSalvar(dados: GastoInput) {
    if (gastoEditando) {
      await atualizarGasto(gastoEditando.id, dados);
    } else {
      await criarGasto(dados);
    }
    setModalAberto(false);
    carregarGastos();
  }

  return (
    <div className="space-y-4">
      <SeletorMesAno mes={mes} ano={ano} onMesAnterior={mesAnterior} onProximoMes={proximoMes} />

      <button
        onClick={handleNovoGasto}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        + Novo gasto
      </button>

      {carregando && <p className="text-slate-500">Carregando...</p>}
      {erro && <p className="text-red-500">{erro}</p>}

      {!carregando && !erro && gastos.length === 0 && (
        <p className="text-slate-500 text-center py-8">Nenhum gasto neste mês.</p>
      )}

      <div className="space-y-2">
        {gastos.map((gasto) => (
          <GastoCard key={gasto.id} gasto={gasto} onEditar={handleEditar} onExcluir={handleExcluir} />
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        titulo={gastoEditando ? 'Editar gasto' : 'Novo gasto'}
        onFechar={() => setModalAberto(false)}
      >
        <GastoForm
          gastoParaEditar={gastoEditando}
          onSalvar={handleSalvar}
          onCancelar={() => setModalAberto(false)}
        />
      </Modal>
    </div>
  );
}

export default Lancamentos;