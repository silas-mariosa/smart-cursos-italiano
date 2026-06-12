# PROJECT_RULES

Regras implícitas e explícitas encontradas no código e nos arquivos `RDA.md` de cada repositório.

---

## Regras globais do ecossistema

### 1. API centralizada nos clientes

> **Proibido** usar `fetch` ou `axios` fora de `lib/api.ts`.

Fonte: `RDA.md` em frontend-parlare, admin-parlare, mobile-parlare.

**Exceções documentadas:**

- Health/stats do games-server encapsulados em `api.getGamesHealth()` / `api.getGamesLiveStats()`
- WebSocket em `hooks/use-games-realtime.tsx`

### 2. Backend como fonte única de persistência

Clientes web e mobile consomem **exclusivamente** `backend-parlare` para dados persistentes. games-server é apenas para estado efêmero de partidas PvP.

### 3. Paridade mobile ↔ web

`mobile-parlare/RDA.md` documenta paridade de API e fluxos com `frontend-parlare`. O `lib/api.ts` do mobile espelha o do frontend.

### 4. Marca e nomenclatura

| Contexto | Nome |
|----------|------|
| Marca comercial / UI | **Manylingua** |
| Nome técnico dos repositórios | `*-parlare` |
| Chaves localStorage | prefixo `parlare_*` |

### 5. Idioma

| Contexto | Regra |
|----------|-------|
| Mensagens de erro API | pt-BR |
| UI admin | pt-BR |
| UI frontend/mobile | pt-BR default; frontend suporta 5 locales |
| Comentários | predominantemente pt-BR |

---

## Regras do backend (`backend-parlare/RDA.md`)

### Estrutura de recursos

1. Novos domínios: criar **sempre** pasta `resource/<nome>` com `handler.ts` + `route.ts`
2. Registrar em `src/index.ts` com `.use(nomeDoRecurso)`
3. Schema do banco: **apenas** em `src/drizzle/schema.ts`
4. Imports entre recursos: caminhos relativos a `src/`

### Handler vs route

| handler.ts | route.ts |
|------------|----------|
| Lógica de negócio, queries Drizzle | Guards Elysia, JWT, HTTP |
| Retorna `{ data, error }` | Chama handler, monta resposta |
| **Não** importar Elysia | **Não** colocar lógica de negócio |

### Rotas admin

- **Todas** em `resource/admin/route.ts` (único `Elysia({ prefix: "/admin" })`)
- **Não** registrar outro plugin com prefixo `/admin` — Elysia pode sobrescrever rotas
- **Exceção:** TTS+S3 em `learning-item-audio/route.ts` como `POST /learning-items/audio/sync`

### Banco de dados

- IDs: UUID texto (`crypto.randomUUID()`)
- Tabelas/colunas: snake_case
- Enums: lowercase
- Após alterar schema: `bun run db:generate` → `bun run migrate`

### Migrations

- Não usar integer auto-increment para PK de entidades principais
- `db:push` apenas em dev, com cuidado

---

## Regras do frontend (`frontend-parlare/RDA.md`)

### Estrutura de pastas

- Páginas em `app/` (App Router)
- Componentes de domínio em `components/<domínio>/`
- Primitivos UI em `components/ui/`
- API em `lib/api.ts`
- Contexto em `lib/context/`
- i18n em `lib/i18n/`

### Protótipo de jogos

- Rotas `/games/prototipo/**` usam dados mock em `lib/competition/mock/`
- **Sem** chamadas à API principal nessas rotas (regra documentada)
- Jogos reais (solo/online) usam API e games-server

### Shell e navegação

- Rotas autenticadas em `app/(app)/` com `AuthenticatedShell`
- Rotas públicas em `app/(public)/` com `PublicShell`
- Redirect `/erros` → `/revisao` (permanente, `next.config.ts`)

---

## Regras do admin (`admin-parlare/RDA.md`)

### Consumo de API

- Consome **exclusivamente** `backend-parlare`
- `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`)

### Páginas

- Todas as páginas do dashboard são `"use client"`
- Sem Server Components com fetch
- Sem API routes Next.js

### Auth

- Login valida admin com `getAdminStats()` após `signIn`
- Proteção de rotas 100% client-side

### SEO

- `robots: { index: false, follow: false }` no metadata

---

## Regras do mobile (`mobile-parlare/RDA.md`)

### API

- Mesma regra: `fetch` apenas em `lib/api.ts`
- `EXPO_PUBLIC_API_URL` via `config/url.ts`

### Token

- `expo-secure-store` (nativo), AsyncStorage (web)
- Chave `authToken`

### Dev networking

- `config/dev-network.ts` reescreve `localhost` para IP LAN / `10.0.2.2` (emulador Android)

### WebSocket

- `GamesRealtimeProvider` compartilhado — uma conexão WS para hub + telas de partida

### OTA e versão

- `runtimeVersion.policy: "appVersion"`
- Modal obrigatório se versão < `minVersion` de `GET /app-version/`

---

## Regras do games-server (`games-server/RDA.md`)

### JWT

- `JWT_SECRET` deve ser **igual** ao backend-parlare

### Estado autoritativo

- Servidor valida todas as `game_action`
- Clientes recebem apenas `state` sanitizado via `toPublicMatchState()`

### Modos de jogo

- Cada modo implementa `GameModeDefinition`
- Registrado em `modes/registry.ts`
- Sanitização: omitir `correctOrderByPlayer` e `sentenceBank` em `sentence_builder`

### Matchmaking

- Script Lua atômico em `pair.ts`
- Confirmação pré-partida: `pending_ready` + `readyUserIds`

### Integração backend

- Header `x-games-internal-key` em todas as chamadas internas
- Deck buscado após ambos confirmarem partida
- Complete enviado ao `finished`

---

## Convenções de código implícitas

### TypeScript

- `strict: true` em todos os repositórios
- Path alias `@/*` nos clientes

### Componentes React

- Funcionais com hooks
- `"use client"` em páginas interativas (Next.js)
- Export default nas pages

### Estado

| Repositório | Padrão |
|-------------|--------|
| frontend/admin | `useState` + `useEffect` + `api.*()` |
| mobile | React Query + Context API |
| backend | Handlers async puros |

### Erros

- Backend: `{ error: string }` em pt-BR
- Clientes: `Alert variant="destructive"` ou toast
- 401: `removeToken()` automático

### Cancelamento em effects

```typescript
useEffect(() => {
  let cancelled = false;
  // fetch...
  return () => { cancelled = true; };
}, [deps]);
```

### Eventos DOM customizados (frontend)

- `parlare-study-phase-change` — ocultar sidebar
- `parlare-notifications-unread-count` — badge

### Preferências locais

- Chaves `parlare_*` em localStorage/AsyncStorage
- Tema: `parlare_pref_theme`

---

## Regras de deploy e ambiente

### Backend

- Swagger apenas quando `NODE_ENV !== "production"`
- `.env` nunca commitar (documentado em RDA)
- Seed admin via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`

### games-server

- `.env` não copiado na imagem Docker
- Variáveis injetadas pelo hosting
- Health check: `GET /health`

### Mobile

- EAS Build para preview/production
- `usesCleartextTraffic: true` no Android (HTTP em dev)
- Firebase e Google Services configurados para builds nativos

---

## Documentação interna obrigatória

Cada repositório possui `RDA.md` como fonte de contexto para desenvolvimento:

| Repositório | Arquivo |
|-------------|---------|
| backend-parlare | `RDA.md` |
| frontend-parlare | `RDA.md` |
| admin-parlare | `RDA.md` |
| mobile-parlare | `RDA.md` |
| games-server | `RDA.md` + `README.md` |

Os `README.md` dos projetos Next.js são templates padrão do create-next-app e **não descrevem** o domínio Manylingua.

---

## Anti-padrões observados (não seguir)

| Anti-padrão | Onde documentado |
|-------------|------------------|
| Criar múltiplos plugins Elysia com prefixo `/admin` | backend RDA |
| Colocar lógica de negócio em `route.ts` | backend RDA |
| Importar Elysia em `handler.ts` | backend RDA |
| `fetch` direto nas páginas | RDA dos clientes |
| Criar arquivos de schema além de `schema.ts` | backend RDA |
| Chamar API principal nas rotas de protótipo de jogos | frontend RDA |
