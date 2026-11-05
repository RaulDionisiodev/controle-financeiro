# Controle Financeiro

Aplicação full stack para lançar gastos pessoais por categoria e gerar, ao final de um período, uma mensagem formatada — pronta para copiar/colar ou enviar diretamente pelo WhatsApp.

Projeto construído do zero com fins de estudo, cobrindo backend, frontend, autenticação, testes automatizados, integração contínua, observabilidade e deploy em produção.

## Índice

- [Funcionalidades](#funcionalidades)
- [Regras de negócio](#regras-de-negócio)
- [Datas e fuso horário](#datas-e-fuso-horário)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados e migrations](#banco-de-dados-e-migrations)
- [Testes automatizados](#testes-automatizados)
- [Integração contínua e fluxo de trabalho](#integração-contínua-e-fluxo-de-trabalho)
- [Documentação da API](#documentação-da-api)
- [Logs e monitoramento](#logs-e-monitoramento)
- [Autenticação](#autenticação)
- [Deploy](#deploy)

## Funcionalidades

- Cadastro, edição e exclusão de gastos (categoria, data, descrição, valor)
- Indicação do **sentido (ida ou volta)** nos gastos de transporte com um toque, sem precisar digitar na descrição
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
- Gastos de Transporte podem ter um **sentido opcional** (`IDA` ou `VOLTA`), exibido ao lado da descrição na mensagem final (ex: `Uber para o trabalho (ida)`), inclusive dentro da seção "Igreja com a Mazé"
- `dividido` e `sentido` só são aceitos na categoria Transporte (validado no backend)
- A mensagem final é detalhada: lista cada gasto individualmente, com subtotal por categoria/seção e total geral do período
- Gastos são ordenados por data e, em caso de empate, pela ordem de lançamento (assim a ida aparece antes da volta no mesmo dia)

## Datas e fuso horário

A data de um gasto é um "dia de calendário", sem hora. Para evitar ambiguidades entre servidor e navegador:

- No banco, a data é gravada como meia-noite UTC e exibida em UTC
- Os filtros de mês e de período usam `Date.UTC` / `setUTCDate`. Usar a hora local do servidor fazia gastos lançados no dia 1º aparecerem no mês anterior quando o servidor rodava fora de UTC
- No frontend, a data sugerida no formulário usa a data **local** (e não `toISOString`, que é UTC e sugeriria o dia seguinte após as 21h no Brasil)
- Os testes fixam `TZ=America/Sao_Paulo` (`vitest.config.ts`), para que regressões de fuso apareçam também no CI, que roda em UTC

## Arquitetura e tecnologias

Monorepo com backend e frontend independentes, comunicando-se via API REST.

### Backend (`/backend`)

- **Node.js 24 (LTS)** + **Express** + **TypeScript** (ESM nativo)
- **Prisma 7** como ORM, com **PostgreSQL** (produção no [Neon](https://neon.com))
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

### Infraestrutura e automação

- **Docker Compose** para os bancos locais (desenvolvimento e testes)
- **GitHub Actions** para rodar os testes a cada Pull Request
- **Render** (backend), **Vercel** (frontend) e **Neon** (banco), todos em plano gratuito

## Estrutura de pastas

```
controle-financeiro/
├── .github/
│   └── workflows/
│       └── tests.yml         # CI: testes do backend a cada PR
├── backend/
│   ├── src/
│   │   ├── config/           # Prisma client, logger (Pino), Sentry
│   │   ├── controllers/      # Camada HTTP (recebe requisição, chama service)
│   │   ├── routes/           # Definição de endpoints
│   │   ├── services/         # Regras de negócio
│   │   ├── schemas/          # Validação com Zod
│   │   ├── middlewares/      # Autenticação, validação de body
│   │   ├── docs/             # Documento OpenAPI
│   │   ├── types/            # Tipos e extensões (ex: Express.Request)
│   │   ├── tests/            # Testes de integração e helpers
│   │   └── generated/        # Prisma Client gerado (git-ignored)
│   ├── prisma/               # Schema e migrations
│   ├── docker-compose.yml    # Bancos locais: desenvolvimento (5435) e testes (5434)
│   ├── prisma.config.ts
│   ├── .nvmrc                # Versão do Node (24)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/            # Telas (Login, Lançamentos, Resumo)
    │   ├── components/       # Componentes reutilizáveis
    │   ├── contexts/         # Contexto de autenticação
    │   ├── hooks/            # Hooks customizados
    │   ├── services/         # Comunicação com a API
    │   ├── types/            # Tipos compartilhados com o backend
    │   └── utils/            # Utilitários (ex: datas)
    ├── .nvmrc
    └── package.json
```

## Como rodar localmente

### Pré-requisitos

- **Node.js 24** (a versão está em `.nvmrc`; com [nvm](https://github.com/nvm-sh/nvm), basta `nvm use`). O `package.json` do backend exige `>=24.22.1`, versão que inclui as correções de segurança de outubro/2026
- Docker
- Um projeto configurado no [Google Cloud Console](https://console.cloud.google.com) (Google Auth Platform) com um Client ID OAuth, com `http://localhost:5173` nas origens JavaScript autorizadas

> **Atenção:** nunca aponte o `DATABASE_URL` local para o banco de produção. Comandos como `prisma migrate dev` alteram o schema diretamente no banco apontado. Em desenvolvimento, use sempre o banco local do Docker.

### Backend

```bash
cd backend
nvm use
npm ci

npm run docker:dev:up        # sobe o Postgres de desenvolvimento (porta 5435)

# crie o backend/.env (veja a seção de variáveis de ambiente)

npx prisma migrate deploy    # aplica as migrations existentes no banco local
npx prisma generate          # gera o Prisma Client (no Prisma 7 isso NÃO é automático)

npm run dev
```

A API sobe em `http://localhost:3333`. Documentação interativa disponível em `http://localhost:3333/docs`.

### Frontend

```bash
cd frontend
nvm use
npm ci

# crie o frontend/.env (veja a seção de variáveis de ambiente)

npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### Scripts do backend

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe a API em modo desenvolvimento (tsx watch) |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm start` | Roda a versão compilada (usado em produção) |
| `npm test` | Roda a suíte de testes (Vitest) |
| `npm run docker:dev:up` | Sobe o Postgres de desenvolvimento |
| `npm run docker:test:up` | Sobe o Postgres de testes |
| `npm run docker:test:down` | Remove o container do Postgres de testes |
| `npm run db:test:migrate` | Aplica as migrations no banco de testes |
| `npm run db:test:studio` | Abre o Prisma Studio no banco de testes |

## Variáveis de ambiente

### `backend/.env`

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL. Localmente: `postgresql://postgres:postgres@localhost:5435/controle_financeiro_dev?schema=public` |
| `GOOGLE_CLIENT_ID` | Client ID OAuth do Google Cloud Console |
| `JWT_SECRET` | Segredo para assinar a sessão (gerar com `openssl rand -base64 32`) |
| `EMAILS_PERMITIDOS` | E-mails autorizados a fazer login, separados por vírgula |
| `SENTRY_DSN` | DSN do projeto no Sentry (opcional em dev) |
| `FRONTEND_URL` | Origem autorizada para CORS (ex: `http://localhost:5173`) |
| `NODE_ENV` | `development` ou `production` |

### `backend/.env.test`

Mesma estrutura, com `DATABASE_URL` apontando para o banco de testes (porta 5434) e sem `SENTRY_DSN`. Use `.env.test.example` como base.

### `frontend/.env`

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend (localmente, `http://localhost:3333`) |
| `VITE_GOOGLE_CLIENT_ID` | Mesmo Client ID usado no backend |

## Banco de dados e migrations

Existem três bancos, cada um com um papel:

| Ambiente | Banco | Observação |
|---|---|---|
| Desenvolvimento | Postgres no Docker (porta 5435) | Dados de uso local |
| Testes | Postgres no Docker (porta 5434) | Limpo a cada teste |
| Produção | Neon | Só recebe migrations via deploy |

### Fluxo para alterar o schema

1. Edite `backend/prisma/schema.prisma`
2. Gere a migration no banco de desenvolvimento:
   ```bash
   npx prisma migrate dev --name descricao_da_mudanca
   npx prisma generate
   ```
3. Revise o SQL gerado em `prisma/migrations/` antes de seguir
4. Aplique no banco de testes e rode a suíte:
   ```bash
   npm run db:test:migrate
   npm test
   ```
5. Abra um Pull Request. O CI aplica **todas** as migrations em um Postgres vazio e roda os testes
6. Ao mergear na `main`, o build do Render executa `prisma migrate deploy` e aplica a migration no Neon

Boas práticas adotadas:

- Preferir migrations **aditivas e compatíveis** (ex: colunas opcionais). Durante um deploy, a versão antiga do código pode rodar por alguns instantes contra o schema novo
- No Prisma 7, `migrate dev` não roda `prisma generate` automaticamente: rode-o sempre depois

## Testes automatizados

Os testes rodam contra um banco PostgreSQL isolado, subido via Docker.

```bash
cd backend
npm run docker:test:up      # sobe o banco de testes
npm run db:test:migrate     # aplica as migrations nele
npm test                    # roda a suíte (Vitest + Supertest)
```

Cobertura atual:

- Regras de negócio: cálculo do transporte dividido, seção "Igreja com a Mazé", sentido ida/volta na mensagem, geração por mês e por período
- Rotas: autenticação (401 sem sessão), criação, listagem, edição, exclusão e geração de mensagem, incluindo validações (Zod) e erros 404
- Casos de borda de data: gastos no primeiro e no último dia do mês, com o fuso fixado em `America/Sao_Paulo`

## Integração contínua e fluxo de trabalho

- O workflow `.github/workflows/tests.yml` roda em **todo Pull Request** para a `main`: sobe um Postgres de serviço, lê a versão do Node de `backend/.nvmrc`, instala dependências com `npm ci`, gera o Prisma Client, aplica as migrations, checa os tipos (`tsc --noEmit`) e roda a suíte
- A branch `main` é **protegida**: só recebe mudanças via Pull Request, com o check `test` passando
- Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat`, `fix`, `chore`, `test`, `docs`, `ci`)

## Documentação da API

A documentação interativa (Swagger UI), gerada automaticamente a partir dos schemas de validação (Zod), fica disponível em `/docs` sempre que o backend está no ar — tanto localmente quanto em produção. A especificação OpenAPI bruta está em `/openapi.json`.

## Logs e monitoramento

- **Logs locais**: estruturados via [Pino](https://getpino.io), com formatação legível em desenvolvimento e JSON puro em produção. Os logs de requisição são enxugados com `redact` (sem headers e outros campos ruidosos)
- **Monitoramento em nuvem**: [Sentry](https://sentry.io) captura erros não tratados, rastreamento de performance (incluindo spans de banco de dados via Prisma) e logs estruturados de eventos de negócio (ex: criação/exclusão de gastos, tentativas de login não autorizadas)

## Autenticação

O login é feito exclusivamente via **Google OAuth**, usando o Google Identity Services no frontend. O fluxo:

1. O frontend obtém um ID token do Google
2. O backend valida esse token com o Google e confere se o e-mail está na lista de `EMAILS_PERMITIDOS`
3. Se autorizado, o backend cria uma sessão própria (JWT em cookie `httpOnly`; em produção, `secure` e `sameSite=none`)
4. Todas as rotas de `/gastos` exigem essa sessão válida

Em produção, frontend (Vercel) e backend (Render) ficam em domínios diferentes, por isso o cookie usa `sameSite=none` + `secure`; com `lax`, o navegador não reenviaria o cookie nas chamadas `fetch` entre os dois domínios. Localmente, `lax` é suficiente.

## Deploy

| Camada | Serviço | Configuração principal |
|---|---|---|
| Backend | [Render](https://render.com) (free tier) | Root Directory `backend` |
| Banco de dados | [Neon](https://neon.com) (PostgreSQL serverless) | Connection string em `DATABASE_URL` |
| Frontend | [Vercel](https://vercel.com) (free tier) | Root Directory `frontend` |

### Render (backend)

- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/health`
- **Variáveis:** as mesmas do `.env` do backend (com `NODE_ENV=production` e `FRONTEND_URL` apontando para a URL da Vercel), mais `NODE_VERSION=24`
- O plano gratuito não oferece "Pre-Deploy Command", por isso as migrations rodam dentro do Build Command
- A variável `NODE_VERSION` tem precedência sobre `.nvmrc` e `engines`; é ela que garante a versão do Node em produção
- O plano gratuito hiberna o serviço após cerca de 15 minutos sem uso, e a primeira requisição depois disso pode levar de 30 a 60 segundos

### Vercel (frontend)

- **Variáveis:** `VITE_API_URL` (URL do backend no Render) e `VITE_GOOGLE_CLIENT_ID`
- **Node.js Version:** 24.x, nas configurações do projeto
- A URL final da Vercel precisa estar nas origens JavaScript autorizadas do Client ID no Google Cloud Console

### Atualizando o Node.js

Ao sair uma correção de segurança do Node.js: atualize `NODE_VERSION` no Render, a versão na Vercel, o `.nvmrc` e o `engines` do backend, e abra um PR. O CI lê o `.nvmrc`, então já valida a nova versão.

---

Projeto desenvolvido por Raul Dionisio como estudo de desenvolvimento full stack moderno (Node.js + React), com apoio do Claude.