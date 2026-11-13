import { prisma } from '../config/prisma.js';
import { Categoria, Prisma, SentidoViagem } from '../generated/prisma/client.js';
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

// Espaçamento da mensagem (quantidade de linhas em branco)
const LINHAS_APOS_TITULO = 3;
const LINHAS_ENTRE_SECOES = 2;
const LINHAS_ANTES_SUBTOTAL = 1;

// N linhas em branco = N + 1 quebras de linha
const linhasEmBranco = (n: number) => '\n'.repeat(n + 1);

const ROTULO_SENTIDO: Record<SentidoViagem, string> = { IDA: 'ida', VOLTA: 'volta' }

type GastoRegistro = Awaited<ReturnType<typeof buscarGastosPeriodo>>[number];

export async function criarGasto(input: GastoInput) {
  const gasto = await prisma.gasto.create({
    data: {
      categoria: input.categoria,
      data: input.data,
      descricao: input.descricao,
      valor: input.valor,
      dividido: input.categoria === Categoria.TRANSPORTE ? (input.dividido ?? false) : null,
      sentido: input.categoria === Categoria.TRANSPORTE ? (input.sentido ?? null) : null,
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
        sentido: input.categoria === Categoria.TRANSPORTE ? (input.sentido ?? null) : null,
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
    orderBy: [{ data: 'asc' }, { criadoEm: 'asc' }],
  });
}

export async function listarGastos(mes: number, ano: number) {
  const inicio = new Date(Date.UTC(ano, mes - 1, 1));
  const fim = new Date(Date.UTC(ano, mes, 1));
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
  let subtotal = 0;
  const linhas: string[] = [];

  for (const gasto of gastosSecao) {
    const valor = Number(gasto.valor);
    const valorConsiderado = opcoes.dividirValor ? valor / 2 : valor;
    subtotal += valorConsiderado;

    const descricao = gasto.sentido
      ? `${gasto.descricao} (${ROTULO_SENTIDO[gasto.sentido]})`
      : gasto.descricao;
    const sufixo = opcoes.dividirValor
      ? ` (dividido - 50%: ${formatarMoeda(valorConsiderado)})`
      : '';

    linhas.push(
      `- *${formatarData(gasto.data)}* - ${descricao}: ${formatarMoeda(valor)}${sufixo}`
    );
  }

  const texto =
    `${titulo}\n` +
    linhas.join('\n') +
    linhasEmBranco(LINHAS_ANTES_SUBTOTAL) +
    `*Subtotal: ${formatarMoeda(subtotal)}*`;

  return { texto, subtotal };
}

export async function gerarMensagemPeriodo(
  dataInicio: Date,
  dataFim: Date,
  tituloPersonalizado?: string
): Promise<string> {
  const fimExclusivo = new Date(dataFim);
  fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);

  const gastos = await buscarGastosPeriodo(dataInicio, fimExclusivo);
  const titulo =
    tituloPersonalizado ?? `${formatarDataLonga(dataInicio)} a ${formatarDataLonga(dataFim)}`;

  if (gastos.length === 0) {
    return `Nenhum gasto registrado no período: ${titulo}.`;
  }

  const secoes: string[] = [];
  let totalGeral = 0;

  function adicionarSecao(tituloSecao: string, gastosSecao: GastoRegistro[], dividirValor: boolean) {
    const secao = renderizarSecao(tituloSecao, gastosSecao, { dividirValor });
    secoes.push(secao.texto);
    totalGeral += secao.subtotal;
  }

  for (const categoria of Object.values(Categoria)) {
    const gastosCategoria = gastos.filter((g) => g.categoria === categoria);
    if (gastosCategoria.length === 0) continue;

    const { emoji, nome } = CATEGORIA_LABELS[categoria];

    if (categoria === Categoria.TRANSPORTE) {
      const naoDivididos = gastosCategoria.filter((g) => !g.dividido);
      const divididos = gastosCategoria.filter((g) => g.dividido);

      if (naoDivididos.length > 0) adicionarSecao(`${emoji} *${nome}*`, naoDivididos, false);
      if (divididos.length > 0) adicionarSecao('⛪️ *Igreja com a Mazé*', divididos, true);
      continue;
    }

    adicionarSecao(`${emoji} *${nome}*`, gastosCategoria, false);
  }

  return (
    `📅 *Resumo Financeiro - ${titulo}*` +
    linhasEmBranco(LINHAS_APOS_TITULO) +
    secoes.join(linhasEmBranco(LINHAS_ENTRE_SECOES)) +
    linhasEmBranco(LINHAS_ENTRE_SECOES) +
    `💰 *Total do período: ${formatarMoeda(totalGeral)}*`
  );
}

export async function gerarMensagemMensal(mes: number, ano: number): Promise<string> {
  const inicio = new Date(Date.UTC(ano, mes - 1, 1));
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)); // dia 0 do mês seguinte = último dia deste mês
  const titulo = `${MESES[mes - 1]}/${ano}`;
  return gerarMensagemPeriodo(inicio, ultimoDia, titulo);
}