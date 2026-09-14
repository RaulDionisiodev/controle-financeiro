# Controle Financeiro

Aplicação full stack para lançar gastos pessoais por categoria e gerar, ao final de um período, uma mensagem formatada — pronta para copiar/colar ou enviar diretamente pelo WhatsApp.

Projeto construído do zero com fins de estudo, cobrindo backend, frontend, autenticação, testes automatizados, observabilidade e deploy em produção.

## Índice

- [Funcionalidades](#funcionalidades)
- [Regras de negócio](#regras-de-negócio)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes automatizados](#testes-automatizados)
- [Documentação da API](#documentação-da-api)
- [Logs e monitoramento](#logs-e-monitoramento)
- [Autenticação](#autenticação)
- [Deploy](#deploy)

## Funcionalidades

- Cadastro, edição e exclusão de gastos (categoria, data, descrição, valor)
- Listagem de gastos por mês, com navegação entre meses
- Geração de mensagem resumo por **mês fechado** ou por **período personalizado** (ex: 15/07 a 15/08)
- Cópia da mensagem para a área de transferência
- Envio direto da mensagem via WhatsApp, com seleção de contato
- Login restrito via Google OAuth (apenas e-mails autorizados)
- Interface 100% responsiva

## Regras de negócio

- Categorias disponíveis: **Compras**, **Serviços**, **Parcelamentos** e **Transporte**
- Gastos de **Transporte** podem ser marcados como **"dividido"** — nesse caso, apenas **50%** do valor entra no subtotal e no total geral
- Gastos de Transporte divididos são exibidos em uma seção própria na mensagem final, com o título **"⛪️ Igreja com a Mazé"**, separados dos gastos de Transporte não divididos
- A mensagem final é detalhada: lista cada gasto individualmente, com subtotal por categoria/seção e total geral do período

## Arquitetura e tecnologias

Monorepo com backend e frontend independentes, comunicando-se via API REST.

### Backend (`/backend`)

- **Node.js** + **Express** + **TypeScript** (ESM nativo)
- **Prisma 7** como ORM, com **PostgreSQL** (hospedado no [Neon](https://neon.com))
- **Zod** para validação de entrada
- **Pino** para logs estruturados
- **Sentry** para rastreamento de erros, performance e logs em produção
- **Google OAuth** (`google-auth-library`) + sessão via JWT em cookie `httpOnly`
- **Vitest** + **Supertest** para testes automatizados, com banco de testes isolado via **Docker**
- **Swagger/OpenAPI** (gerado a partir dos schemas Zod) para documentação interativa da API

### Frontend (`/frontend`)

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS** para estilização e responsividade
- **React Router** para navegação entre telas
- Consumo da API via `fetch` nativo, com sessão baseada em cookies

## Estrutura de pastas

```
controle-financeiro/
├── backend/
│   ├── src/
│   │   ├── config/          # Prisma client, logger (Pino), Sentry
│   │   ├── controllers/     # Camada HTTP (recebe requisição, chama service)
│   │   ├── routes/          # Definição de endpoints
│   │   ├── services/        # Regras de negócio
│   │   ├── schemas/         # Validação com Zod
│   │   ├── middlewares/     # Autenticação, validação de body
│   │   ├── docs/            # Documento OpenAPI
│   │   ├── types/           # Tipos e extensões (ex: Express.Request)
│   │   ├── tests/           # Testes de integração e helpers
│   │   └── generated/       # Prisma Client gerado (git-ignored)
│   ├── prisma/               # Schema e migrations
│   ├── docker-compose.yml    # Banco de testes isolado
│   ├── prisma.config.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/            # Telas (Login, Lançamentos, Resumo)
    │   ├── components/       # Componentes reutilizáveis
    │   ├── contexts/         # Contexto de autenticação
    │   ├── hooks/            # Hooks customizados
    │   ├── services/         # Comunicação com a API
    │   └── types/            # Tipos compartilhados com o backend
    └── package.json
```

## Como rodar localmente

### Pré-requisitos

- Node.js 22+
- Docker (para o banco de testes)
- Uma instância PostgreSQL (local, Docker ou serviço gratuito como o Neon)
- Um projeto configurado no [Google Cloud Console](https://console.cloud.google.com) (Google Auth Platform) com um Client ID OAuth

### Backend

```bash
cd backend
npm install

# Configure o .env (veja a seção de variáveis de ambiente abaixo)
cp .env.test.example .env.test

npx prisma generate
npx prisma migrate dev

npm run dev
```

A API sobe em `http://localhost:3333`. Documentação interativa disponível em `http://localhost:3333/docs`.

### Frontend

```bash
cd frontend
npm install

# Configure o .env (veja a seção de variáveis de ambiente abaixo)

npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Variáveis de ambiente

### `backend/.env`

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `GOOGLE_CLIENT_ID` | Client ID OAuth do Google Cloud Console |
| `JWT_SECRET` | Segredo para assinar a sessão (gerar com `openssl rand -base64 32`) |
| `EMAILS_PERMITIDOS` | E-mails autorizados a fazer login, separados por vírgula |
| `SENTRY_DSN` | DSN do projeto no Sentry (opcional em dev) |
| `FRONTEND_URL` | Origem autorizada para CORS (ex: `http://localhost:5173`) |
| `NODE_ENV` | `development` ou `production` |

### `backend/.env.test`

Mesma estrutura acima, apontando `DATABASE_URL` para o banco de testes local (subido via `docker compose`).

### `frontend/.env`

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend |
| `VITE_GOOGLE_CLIENT_ID` | Mesmo Client ID usado no backend |

## Testes automatizados

Os testes rodam contra um banco PostgreSQL isolado, subido via Docker.

```bash
cd backend
npm run docker:test:up      # sobe o banco de testes
npm run db:test:migrate     # aplica as migrations nele
npm test                    # roda a suíte (Vitest + Supertest)
```

Cobertura atual: testes unitários das regras de negócio (cálculo do transporte dividido, geração da mensagem) e testes de integração de todas as rotas (autenticação, criação, listagem, edição, exclusão, geração de mensagem).

## Documentação da API

A documentação interativa (Swagger UI), gerada automaticamente a partir dos schemas de validação (Zod), fica disponível em `/docs` sempre que o backend está no ar — tanto localmente quanto em produção. A especificação OpenAPI bruta está em `/openapi.json`.

## Logs e monitoramento

- **Logs locais**: estruturados via [Pino](https://getpino.io), com formatação legível em desenvolvimento e JSON puro em produção
- **Monitoramento em nuvem**: [Sentry](https://sentry.io) captura erros não tratados, rastreamento de performance (incluindo spans de banco de dados via Prisma) e logs estruturados de eventos de negócio (ex: criação/exclusão de gastos)

## Autenticação

O login é feito exclusivamente via **Google OAuth**, usando o Google Identity Services no frontend. O fluxo:

1. O frontend obtém um ID token do Google
2. O backend valida esse token com o Google e confere se o e-mail está na lista de `EMAILS_PERMITIDOS`
3. Se autorizado, o backend cria uma sessão própria (JWT em cookie `httpOnly`, `secure` e `sameSite=none` em produção)
4. Todas as rotas de `/gastos` exigem essa sessão válida

## Deploy

- **Backend**: [Render](https://render.com) (free tier), com build rodando `prisma generate` + `prisma migrate deploy` antes de compilar o TypeScript
- **Banco de dados**: [Neon](https://neon.com) (PostgreSQL serverless, free tier)
- **Frontend**: [Vercel](https://vercel.com) (free tier), deploy automático a partir da pasta `frontend/`

Por se tratar de um monorepo, tanto o Render quanto a Vercel são configurados com **Root Directory** apontando para `backend/` e `frontend/`, respectivamente.

---

Projeto desenvolvido por Raul Dionisio como estudo de desenvolvimento full stack moderno (Node.js + React), com apoio do Claude.