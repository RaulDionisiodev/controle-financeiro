export type Categoria = 'COMPRAS' | 'SERVICOS' | 'PARCELAMENTOS' | 'TRANSPORTE';

export type Sentido = 'IDA' | 'VOLTA';

export type Grupo = 'IGREJA_MAZE';
export interface Gasto {
  id: string;
  categoria: Categoria;
  data: string; // ISO string, como vem da API
  descricao: string;
  valor: string; // Decimal do Prisma vem serializado como string em JSON
  divisor: number | null;
  grupo: Grupo | null;
  sentido: Sentido | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface GastoInput {
  categoria: Categoria;
  data: string;
  descricao: string;
  valor: number;
  divisor?: number;
  grupo?: Grupo;
  sentido?: Sentido;
}

export const CATEGORIAS: { valor: Categoria; label: string }[] = [
  { valor: 'COMPRAS', label: 'Compras' },
  { valor: 'SERVICOS', label: 'Serviços' },
  { valor: 'PARCELAMENTOS', label: 'Parcelamentos' },
  { valor: 'TRANSPORTE', label: 'Transporte' },
];

export const SENTIDOS: { valor: Sentido; label: string }[] = [
  { valor: 'IDA', label: 'Ida' },
  { valor: 'VOLTA', label: 'Volta' },
];

export const GRUPO_LABEL: Record<Grupo, string> = {
  IGREJA_MAZE: '⛪️ Igreja com a Mazé',
};

export const GRUPOS = Object.keys(GRUPO_LABEL) as Grupo[];