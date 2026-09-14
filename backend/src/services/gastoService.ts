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

type GastoRegistro = Awaited<ReturnType<typeof buscarGastosPeriodo>>[number];

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
    logger.info({ gastoId: id }, 'Gasto excluído');
    Sentry.logger.info('Gasto excluído', { gastoId: id });
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

function renderizarSecao(
  titulo: string,
  gastosSecao: GastoRegistro[],
  opcoes: { dividirValor: boolean }
): { texto: string; subtotal: number } {
  let texto = `${titulo}\n`;
  let subtotal = 0;

  for (const gasto of gastosSecao) {
    const valor = Number(gasto.valor);
    const valorConsiderado = opcoes.dividirValor ? valor / 2 : valor;
    subtotal += valorConsiderado;

    const sufixo = opcoes.dividirValor
      ? ` (dividido - 50%: ${formatarMoeda(valorConsiderado)})`
      : '';
    texto += `- ${formatarData(gasto.data)} ${gasto.descricao}: ${formatarMoeda(valor)}${sufixo}\n`;
  }

  texto += `Subtotal: ${formatarMoeda(subtotal)}\n\n`;
  return { texto, subtotal };
}

export async function gerarMensagemPeriodo(
  dataInicio: Date,
  dataFim: Date,
  tituloPersonalizado?: string
): Promise<string> {
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

    if (categoria === Categoria.TRANSPORTE) {
      const naoDivididos = gastosCategoria.filter((g) => !g.dividido);
      const divididos = gastosCategoria.filter((g) => g.dividido);

      if (naoDivididos.length > 0) {
        const { emoji, nome } = CATEGORIA_LABELS[categoria];
        const secao = renderizarSecao(`${emoji} *${nome}*`, naoDivididos, { dividirValor: false });
        mensagem += secao.texto;
        totalGeral += secao.subtotal;
      }

      if (divididos.length > 0) {
        const secao = renderizarSecao('⛪️ *Igreja com a Mazé*', divididos, { dividirValor: true });
        mensagem += secao.texto;
        totalGeral += secao.subtotal;
      }

      continue;
    }

    const { emoji, nome } = CATEGORIA_LABELS[categoria];
    const secao = renderizarSecao(`${emoji} *${nome}*`, gastosCategoria, { dividirValor: false });
    mensagem += secao.texto;
    totalGeral += secao.subtotal;
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