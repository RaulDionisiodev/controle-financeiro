import { useState } from 'react';
import { useMesAno } from '../hooks/useMesAno';
import { useContatos } from '../hooks/useContatos';
import { gerarMensagem, gerarMensagemPeriodo } from '../services/gastoService';
import SeletorMesAno from '../components/SeletorMesAno';
import Modal from '../components/Modal';
import GerenciarContatos from '../components/GerenciarContatos';

type Modo = 'mes' | 'periodo';

function hojeISO(): string {
  return new Date().toISOString().split('T')[0];
}

function Resumo() {
  const { mes, ano, mesAnterior, proximoMes } = useMesAno();
  const { contatos, adicionarContato, removerContato } = useContatos();

  const [modo, setModo] = useState<Modo>('mes');
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [dataFim, setDataFim] = useState(hojeISO());

  const [mensagem, setMensagem] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [contatoSelecionadoId, setContatoSelecionadoId] = useState('');
  const [modalContatoAberto, setModalContatoAberto] = useState(false);

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    setMensagem('');
    try {
      const resultado =
        modo === 'mes'
          ? await gerarMensagem(mes, ano)
          : await gerarMensagemPeriodo(dataInicio, dataFim);
      setMensagem(resultado.mensagem);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível gerar a mensagem.');
    } finally {
      setGerando(false);
    }
  }

  async function handleCopiar() {
    await navigator.clipboard.writeText(mensagem);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function handleEnviarWhatsApp() {
    const contato = contatos.find((c) => c.id === contatoSelecionadoId);
    if (!contato) return;
    const url = `https://api.whatsapp.com/send?phone=${contato.telefone}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-white rounded-xl border border-slate-200 p-1">
        <button
          onClick={() => setModo('mes')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            modo === 'mes' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mês
        </button>
        <button
          onClick={() => setModo('periodo')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            modo === 'periodo' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Período personalizado
        </button>
      </div>

      {modo === 'mes' ? (
        <SeletorMesAno mes={mes} ano={ano} onMesAnterior={mesAnterior} onProximoMes={proximoMes} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleGerar}
        disabled={gerando}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {gerando ? 'Gerando...' : 'Gerar mensagem'}
      </button>

      {erro && <p className="text-red-500">{erro}</p>}

      {mensagem && (
        <div className="space-y-3">
          <pre className="whitespace-pre-wrap bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 font-sans">
            {mensagem}
          </pre>

          <button
            onClick={handleCopiar}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
          >
            {copiado ? 'Copiado!' : 'Copiar mensagem'}
          </button>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Enviar para um contato</p>

            {contatos.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum contato cadastrado ainda.</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={contatoSelecionadoId}
                  onChange={(e) => setContatoSelecionadoId(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">Selecione um contato</option>
                  {contatos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <button
                  onClick={handleEnviarWhatsApp}
                  disabled={!contatoSelecionadoId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Enviar no WhatsApp
                </button>
              </div>
            )}

            <button
              onClick={() => setModalContatoAberto(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Gerenciar contatos
            </button>
          </div>
        </div>
      )}

      <Modal aberto={modalContatoAberto} titulo="Contatos" onFechar={() => setModalContatoAberto(false)}>
        <GerenciarContatos contatos={contatos} onAdicionar={adicionarContato} onRemover={removerContato} />
      </Modal>
    </div>
  );
}

export default Resumo;