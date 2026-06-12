# ARCHITECTURE

Arquitetura factual do ecossistema Parlare / Manylingua.

---

## Visão macro

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ frontend-parlare│  │  admin-parlare  │  │  mobile-parlare │
│   (Next.js)     │  │   (Next.js)     │  │     (Expo)      │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │    HTTP (JWT Bearer + cookies)           │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │ backend-parlare │
                    │  (Elysia/Bun)   │
                    │   PostgreSQL    │
                    └────────┬────────┘
                             │ HTTP interno (x-games-internal-key)
                             ▼
                    ┌─────────────────┐
                    │  games-server   │
                    │ (Elysia/Redis)  │
                    └─────────────────┘
```

- Clientes web e mobile consomem **exclusivamente** `backend-parlare` para dados persistentes.
- Jogos PvP em tempo real passam pelo **games-server** (WebSocket + Redis).
- Partidas solo vão direto ao backend (`/games/matches/solo/complete`).
- O games-server busca deck e persiste resultados no backend via endpoints internos.

---

## backend-parlare

### Estrutura de pastas

```
backend-parlare/
├── src/
│   ├── index.ts                 # Entry: CORS, cookie, JWT, registro de rotas
│   ├── config/read-env.ts       # Leitura normalizada de env
│   ├── drizzle/
│   │   ├── schema.ts            # ÚNICO arquivo de schema
│   │   ├── db.ts                # Instância drizzle
│   │   ├── migrate.ts, seed.ts
│   ├── jwt/                     # Plugin JWT
│   ├── middleware/
│   │   ├── auth.ts              # authMiddleware (definido, pouco usado)
│   │   └── admin-auth.ts        # getAdminProfile()
│   ├── ai/                      # Geração IA, TTS, schemas Zod
│   ├── storage/                 # S3 upload
│   ├── lib/                     # games-server-client, matchmaking log
│   ├── components/              # Templates de e-mail
│   ├── i18n/                    # Locale de e-mails
│   └── resource/                # Domínios da API (handler + route)
├── drizzle/migrations/
├── drizzle.config.ts
└── RDA.md
```

### Organização por domínio

Cada domínio em `src/resource/<nome>/`:

| Pasta | Prefixo API | Responsabilidade |
|-------|-------------|------------------|
| `auth` | `/auth` | Cadastro, login, OAuth, perfil |
| `content` | `/content` | Idiomas, categorias, temas, itens |
| `study` | `/study` | Sessões, energia, preferências |
| `placement-test` | `/placement-test` | Teste de nivelamento |
| `progress` | `/progress` | Progresso e histórico |
| `gamification` | `/gamification` | Stats, badges, missões |
| `competition` | `/competition` | Party, ranking, cron |
| `social` | `/social` | Seguir, amizades, bloqueios |
| `notifications` | `/notifications` | Notificações in-app |
| `plans` | `/plans` | Planos |
| `subscription` | `/subscription` | RevenueCat webhook |
| `games` | `/games` | Deck, solo, endpoints internos |
| `admin` | `/admin` | Todas rotas admin centralizadas |
| `admin-gamification` | `/admin/gamification` | CRUD badges/missões |
| `admin-messages` | `/admin/messages` | Campanhas e-mail |
| `admin-push` | `/admin/push` | Push Expo |
| `app-version` | `/app-version` | Versão mínima do app |
| `learning-item-audio` | `/learning-items/audio` | Sync TTS+S3 |
| `invites` | `/invites` | Convites por e-mail |
| `messages` | `/messages` | Scheduler interno |
| `email-unsubscribe` | `/email` | Descadastro |

**Exceções documentadas:**

- Rotas `/admin/*` centralizadas em `resource/admin/route.ts` (handlers em subpastas).
- TTS+S3 em `learning-item-audio/route.ts` fora de `/admin` (evita conflito de plugins Elysia).

### Camadas da aplicação

| Camada | Localização | Responsabilidade |
|--------|-------------|------------------|
| **Route** | `resource/*/route.ts` | HTTP, guards Elysia, JWT, status codes |
| **Handler** | `resource/*/handler.ts` | Lógica de negócio, queries Drizzle |
| **Schema** | `drizzle/schema.ts` | Definição de tabelas e relations |
| **DB** | `drizzle/db.ts` | Conexão PostgreSQL |
| **AI** | `ai/` | Geração, TTS, persistência, logs |
| **Storage** | `storage/` | Upload S3 |
| **Middleware** | `middleware/` | Auth admin |

**Sem camada Repository** — handlers consultam `db` diretamente.

### Fluxo de dados (exemplo: sessão de estudo)

```
Cliente → POST /study/session
    → route.ts (valida JWT, body)
    → handler.ts (monta deck, gera itens via IA se necessário)
    → drizzle/db → PostgreSQL
    → handler retorna { data, error }
    → route.ts monta resposta HTTP
```

Streaming NDJSON suportado em `getStudySession` com `streamProgress=1`.

---

## frontend-parlare

### Estrutura de pastas

```
frontend-parlare/
├── app/
│   ├── layout.tsx              # Providers globais
│   ├── (app)/                  # Rotas autenticadas
│   └── (public)/               # Rotas públicas
├── components/
│   ├── ui/                     # shadcn (~56)
│   ├── layout/                 # Shells
│   ├── study/, review/, games/, social/, conta/, ...
├── hooks/                      # use-games-realtime, etc.
├── lib/
│   ├── api.ts                  # ÚNICO cliente HTTP
│   ├── context/                # AppContext, UiLocaleContext
│   ├── i18n/                   # messages.ts (5 locales)
│   └── games/, competition/mock/
└── middleware.ts               # Apenas app-ads.txt
```

### Camadas

| Camada | Responsabilidade |
|--------|------------------|
| **Pages** | `"use client"`; delegam para componentes de domínio |
| **Layouts** | `AuthenticatedShell`, `PublicShell`, sub-layouts |
| **Context** | `AppContext` (user, stats, energia), `UiLocaleContext` |
| **API** | `ApiClient` singleton em `lib/api.ts` |
| **Componentes de domínio** | `components/study/`, `components/games/`, etc. |

### Fluxo de dados

```
Page (useEffect) → api.*() → backend-parlare
    → AppContext atualiza estado global
    → Componentes re-renderizam

Jogos PvP:
Page → use-games-realtime (WebSocket) → games-server
    → Ao finished: games-server → backend (complete)
```

---

## admin-parlare

### Estrutura

```
admin-parlare/
├── app/
│   ├── login/
│   └── dashboard/
│       ├── conteudo/           # Sub-nav: idiomas, categorias, temas, itens, áudio
│       ├── gamificacao/        # Badges, missões, parties
│       ├── usuarios/, planos/, mensagens/, push/, ...
├── components/ui/              # shadcn
├── lib/
│   ├── api.ts                  # ÚNICO cliente HTTP
│   └── types.ts
```

### Arquitetura

- **Monolito frontend** — sem camada `services/`.
- **Todas as páginas são Client Components** — sem Server Components com fetch.
- **Sem middleware Next.js** — proteção 100% client-side.
- **Sem API routes Next.js** — fala direto com backend externo.

---

## mobile-parlare

### Estrutura

```
mobile-parlare/
├── app/
│   ├── _layout.tsx             # Providers globais
│   ├── index.tsx               # Gate de auth/onboarding
│   ├── (public)/, (auth)/, (app)/
│   │   └── (tabs)/             # 6 abas
├── components/                 # Por domínio
├── context/                    # Auth, RevenueCat, Competition, Theme, UiLocale
├── hooks/                      # games-realtime, push, payment
├── lib/api.ts                  # Cliente HTTP (espelha frontend)
└── config/                     # url.ts, games-env.ts, dev-network.ts
```

### Fluxo de bootstrap

1. `_layout.tsx`: splash, OTA, providers encadeados
2. `AuthContext`: `api.hydrate()` → `getMe()` se token
3. `index.tsx`: redirect por estado (auth, onboarding, tabs)
4. `(app)/_layout.tsx`: exige auth; monta `GamesRealtimeProvider`

### Diferenças em relação ao web

- **React Query** para cache de dados servidor
- **SecureStore** para token (nativo)
- **Expo Router** file-based
- **NativeWind** em vez de Tailwind CSS web

---

## games-server

### Estrutura

```
games-server/
├── src/
│   ├── index.ts                # Elysia + WS /ws
│   ├── config/env.ts
│   ├── redis/                  # client, keys
│   ├── matchmaking/pair.ts     # Lua script atômico
│   ├── modes/                  # 4 modos plugáveis
│   ├── ws/connection-map.ts    # userId → sockets
│   └── services/               # backend-match-complete, game-deck, purge
```

### Fluxo PvP

```
Cliente WS (?token=JWT)
    → join_queue → Redis sorted set
    → pair.ts (Lua atômico)
    → match_found + pending_ready
    → confirm_match (ambos jogadores)
    → GET deck no backend
    → match_confirmed + state inicial
    → game_action (loop autoritativo)
    → finished → POST complete no backend
```

### Padrões arquiteturais encontrados

| Padrão | Onde |
|--------|------|
| **Resource modules** (handler + route) | backend-parlare |
| **Monolithic API client** | frontend, admin, mobile (`lib/api.ts`) |
| **Client-side route guard** | frontend, admin (sem middleware auth) |
| **Context API** | frontend (`AppContext`), mobile (múltiplos contexts) |
| **Plug-in game modes** | games-server (`GameModeDefinition`) |
| **Authoritative server** | games-server (valida todas `game_action`) |
| **Lazy generation** | backend IA (gera itens sob demanda) |
| **Cron interno** | backend (convites, fechamento competição) |
| **Internal API keys** | backend ↔ games-server (`x-games-internal-key`, `x-cron-secret`) |
