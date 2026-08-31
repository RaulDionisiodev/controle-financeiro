import { prisma } from '../config/prisma.js';
import { Categoria, Prisma } from '../generated/prisma/client.js';
import type { GastoInput } from '../schemas/gastoSchema.js';
import { logger } from '../config/logger.js';
import { Sentry } from '../config/sentry.js';


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

export async function criarGasto(input: GastoInput) {
  const gasto = await prisma.gasto.create({
    data: {
      categoria: input.categoria,
      data: input.data,
      descricao: input.descricao,
      valor: input.valor,
      dividido: input.categoria === Categoria.TRANSPORTE ? (input.dividido ?? false) : null,
    },
  });

  logger.info({ gastoId: gasto.id, categoria: gasto.categoria }, 'Gasto criado');
  Sentry.logger.info('Gasto criado', { gastoId: gasto.id, categoria: gasto.categoria });

  return gasto;
}

function formatarMoeda(valor: number): string {
  return valor
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    .replace(/\u00A0/g, ' ');
}

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

export async function atualizarGasto(id: string, input: GastoInput) {

  try {
    return await prisma.gasto.update({
      where: { id },
      data: {
        categoria: input.categoria,
        data: input.data,
        descricao: input.descricao,
        valor: input.valor,
        dividido: input.categoria === Categoria.TRANSPORTE ? (input.dividido ?? false) : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Gasto não encontrado');
    }
    throw error;
  }
}

export async function deletarGasto(id: string) {
  try {
    await prisma.gasto.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Gasto não encontrado');
    }
    throw error;
  }
}

async function buscarGastosPeriodo(inicio: Date, fimExclusivo: Date) {
  return prisma.gasto.findMany({
    where: {
      data: {
        gte: inicio,
        lt: fimExclusivo,
      },
    },
    orderBy: { data: 'asc' },
  });
}

export async function listarGastos(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 1);
  return buscarGastosPeriodo(inicio, fim);
}

function formatarDataLonga(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}

export async function gerarMensagemPeriodo(
  dataInicio: Date,
  dataFim: Date,
  tituloPersonalizado?: string
): Promise<string> {
  // dataFim é inclusiva (o próprio dia 15/08 deve entrar) — por isso avançamos 1 dia
  // para transformar em limite exclusivo na consulta.
  const fimExclusivo = new Date(dataFim);
  fimExclusivo.setDate(fimExclusivo.getDate() + 1);

  const gastos = await buscarGastosPeriodo(dataInicio, fimExclusivo);
  const titulo = tituloPersonalizado ?? `${formatarDataLonga(dataInicio)} a ${formatarDataLonga(dataFim)}`;

  if (gastos.length === 0) {
    return `Nenhum gasto registrado no período: ${titulo}.`;
  }

  let mensagem = `📅 *Resumo Financeiro - ${titulo}*\n\n`;
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

  mensagem += `💰 *Total do período: ${formatarMoeda(totalGeral)}*`;

  return mensagem;
}

export async function gerarMensagemMensal(mes: number, ano: number): Promise<string> {
  const inicio = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0); // dia 0 do mês seguinte = último dia do mês atual
  const titulo = `${MESES[mes - 1]}/${ano}`;
  return gerarMensagemPeriodo(inicio, ultimoDia, titulo);
}