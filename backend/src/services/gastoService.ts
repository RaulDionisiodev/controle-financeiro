import { prisma } from '../config/prisma.js';
import { Categoria } from '../generated/prisma/client.js';

interface CriarGastoInput {
  categoria: Categoria;
  data: Date;
  descricao: string;
  valor: number;
  dividido?: boolean;
}

const CATEGORIA_LABELS: Record<Categoria, { emoji: string; nome: string }> = {
  COMPRAS: { emoji: '🛒', nome: 'Compras' },
  SERVICOS: { emoji: '🔧', nome: 'Serviços' },
  PARCELAMENTOS: { emoji: '💳', nome: 'Parcelamentos' },
  TRANSPORTE: { emoji: '🚗', nome: 'Transporte' },
};

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export async function criarGasto(input: CriarGastoInput) {
  if (input.dividido && input.categoria !== Categoria.TRANSPORTE) {
    throw new Error('O campo "dividido" só é válido para a categoria transporte');
  }

  return prisma.gasto.create({
    data: {
      categoria: input.categoria,
      data: input.data,
      descricao: input.descricao,
      valor: input.valor,
      dividido: input.categoria === Categoria.TRANSPORTE ? (input.dividido ?? false) : null,
    },
  });
}

export async function listarGastos(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1); // primeiro dia do mês seguinte

  return prisma.gasto.findMany({
    where: {
      data: {
        gte: inicio,
        lt: fim,
      },
    },
    orderBy: {
      data: 'asc',
    },
  });
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

export async function gerarMensagemMensal(mes: number, ano: number): Promise<string> {
  const gastos = await listarGastos(mes, ano);

  if (gastos.length === 0) {
    return `Nenhum gasto registrado em ${MESES[mes - 1]}/${ano}.`;
  }

  let mensagem = `📅 *Resumo Financeiro - ${MESES[mes - 1]}/${ano}*\n\n`;
  let totalGeral = 0;

  for (const categoria of Object.values(Categoria)) {
    const gastosCategoria = gastos.filter((g) => g.categoria === categoria);
    if (gastosCategoria.length === 0) continue;

    const { emoji, nome } = CATEGORIA_LABELS[categoria];
    mensagem += `${emoji} *${nome}*\n`;

    let subtotal = 0;
    for (const gasto of gastosCategoria) {
      const valor = Number(gasto.valor);
      const valorConsiderado = gasto.dividido ? valor / 2 : valor;
      subtotal += valorConsiderado;

      const sufixo = gasto.dividido
        ? ` (dividido - 50%: ${formatarMoeda(valorConsiderado)})`
        : '';
      mensagem += `- ${formatarData(gasto.data)} ${gasto.descricao}: ${formatarMoeda(valor)}${sufixo}\n`;
    }

    mensagem += `Subtotal: ${formatarMoeda(subtotal)}\n\n`;
    totalGeral += subtotal;
  }

  mensagem += `💰 *Total do mês: ${formatarMoeda(totalGeral)}*`;

  return mensagem;
}
