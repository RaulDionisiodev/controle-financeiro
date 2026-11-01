export type Categoria = 'COMPRAS' | 'SERVICOS' | 'PARCELAMENTOS' | 'TRANSPORTE';

export type Sentido = 'IDA' | 'VOLTA';
export interface Gasto {
  id: string;
  categoria: Categoria;
  data: string; // ISO string, como vem da API
  descricao: string;
  valor: string; // Decimal do Prisma vem serializado como string em JSON
  dividido: boolean | null;
  sentido: Sentido | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface GastoInput {
  categoria: Categoria;
  data: string;
  descricao: string;
  valor: number;
  dividido?: boolean;
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