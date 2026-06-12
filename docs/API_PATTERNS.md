# API_PATTERNS

Padrões de API observados no código de `backend-parlare` e nos clientes (`lib/api.ts`).

---

## Padrão de endpoints

### Estrutura geral

- Prefixos por recurso/domínio
- Rotas REST com verbos HTTP convencionais
- Um módulo Elysia por domínio: `new Elysia({ prefix: "/<recurso>" })`

### Módulos registrados (`src/index.ts`)

| Prefixo | Domínio |
|---------|---------|
| `/auth` | Autenticação e perfil |
| `/content` | Catálogo |
| `/study` | Sessões de estudo |
| `/placement-test` | Teste de nivelamento |
| `/progress` | Progresso |
| `/gamification` | Stats, badges, missões |
| `/plans` | Planos |
| `/admin/gamification` | CRUD badges/missões (admin) |
| `/admin` | Rotas administrativas centralizadas |
| `/admin/messages` | Campanhas e-mail |
| `/admin/push` | Push Expo |
| `/app-version` | Versão do app |
| `/learning-items/audio` | Sync TTS+S3 |
| `/invites` | Convites |
| `/competition` | Competição semanal |
| `/social` | Social |
| `/notifications` | Notificações |
| `/messages` | Scheduler interno |
| `/email` | Descadastro |
| `/games` | Jogos (deck, solo, internos) |
| `/subscription` | Webhook RevenueCat |

### Rotas internas (protegidas por segredo)

| Header | Variável | Endpoints |
|--------|----------|-----------|
| `x-cron-secret` | `CRON_SECRET` | `/invites/internal/run`, `/competition/internal/close-weeks`, `/messages/internal/run` |
| `x-games-internal-key` | `GAMES_INTERNAL_API_KEY` | `/games/internal/*` |

### Webhook

- `POST /subscription/webhooks/revenuecat` — validação opcional via `REVENUECAT_WEBHOOK_SECRET`

### games-server (separado)

| Rota | Descrição |
|------|-----------|
| `GET /health` | Ping Redis |
| `GET /stats/live` | Contagens por modo |
| `WS /ws?token=<JWT>` | Canal de jogos |
| `POST /internal/users/:userId/purge` | Purge LGPD |

---

## Padrão handler vs route (backend)

| Arquivo | Responsabilidade | Proibido |
|---------|------------------|----------|
| **handler.ts** | Lógica de negócio, queries Drizzle. Retorna `{ data, error }` ou `{ success, error }` | Importar Elysia, acessar headers/body, retornar HTTP |
| **route.ts** | Guards Elysia, extrair token, chamar handler, montar resposta HTTP | Lógica de negócio, queries complexas |

### Assinatura de retorno do handler

```typescript
type Result<T> = { data: T | null; error: string | null };
// ou
{ success: boolean; error: string | null };
```

### Regras de novos recursos

1. Criar pasta `resource/<nome>` com `handler.ts` + `route.ts`
2. Registrar em `src/index.ts` com `.use(nomeDoRecurso)`
3. Rotas `/admin/*` apenas em `resource/admin/route.ts`

---

## Validação

### Backend

| Camada | Ferramenta | Uso |
|--------|------------|-----|
| HTTP body/query | Elysia guards (`t.Object`, `t.String`, `t.Optional`, etc.) | Todas as routes |
| Respostas IA | Zod v4 (`src/ai/schemas/`) | Antes de persistir itens gerados |
| Parâmetros | Validação inline nas routes | UUID, enums, ranges |

### Clientes

- Tipos em `lib/types.ts` (admin) ou exportados de `lib/api.ts` (frontend/mobile)
- Validação de formulários: predominantemente manual (`useState`); `react-hook-form` + `zod` instalados mas pouco usados nas páginas

---

## Tratamento de erros

### Backend

| Formato | Exemplo |
|---------|---------|
| `{ error: string }` | Mensagens em português |
| `error(status, message)` / `status(code, message)` | Helpers Elysia |

**Status HTTP observados:**

| Código | Uso |
|--------|-----|
| 400 | Validação, regra de negócio |
| 401 | Token ausente/inválido |
| 403 | Sem permissão (ex.: não-admin) |
| 404 | Recurso não encontrado |
| 500 | Erro interno |

Logs operacionais em `backend_error_logs` para falhas de IA e persistência.

### Clientes (`lib/api.ts`)

```typescript
// Padrão em request<T>():
// 1. Parse JSON
// 2. Se !response.ok: extrair error/message do body
// 3. Se 401: removeToken() + throw Error
// 4. throw Error com mensagem
```

Mensagens exibidas via `Alert variant="destructive"` (admin) ou contexto/toast (frontend).

---

## Autorização

### Usuário autenticado

Padrão dominante nas routes:

```typescript
const authToken = headers.authorization?.split(" ")[1];
const payload = await jwt.verify(authToken);
const userId = (payload as { userId?: string })?.userId;
```

### Admin

```typescript
const result = await getAdminProfile(jwt, authToken);
// Verifica JWT + auth.role === "admin" no banco
```

Função em `src/middleware/admin-auth.ts`.

### Endpoints públicos

- `GET /app-version/` — versão mínima do app
- `GET /content/languages` — idiomas
- Rotas de auth (signup, signin, forgot-password)
- `POST /subscription/webhooks/revenuecat`
- `GET /email/unsubscribe/*`

### games-server

- WebSocket: JWT via query `?token=`
- REST interno: header `x-games-internal-key`

---

## Padrão do cliente HTTP (`lib/api.ts`)

Presente em frontend-parlare, admin-parlare e mobile-parlare.

| Aspecto | Implementação |
|---------|---------------|
| Classe | `ApiClient` com método privado `request<T>()` |
| Export | Singleton `export const api = new ApiClient(API_BASE_URL)` |
| Auth | `Authorization: Bearer <token>` quando token existe |
| Cookies | `credentials: "include"` |
| Token storage | `localStorage.authToken` (web/admin); SecureStore/AsyncStorage (mobile) |
| Regra | Proibido `fetch`/`axios` fora de `lib/api.ts` (documentado em RDA.md) |

### Exceções documentadas

- Health/stats do games-server encapsulados em `api.getGamesHealth()` / `api.getGamesLiveStats()`
- WebSocket em `hooks/use-games-realtime.tsx` (não passa pelo ApiClient)

### Streaming

- `getStudySession` suporta NDJSON com `streamProgress=1` e callback `onBuildProgress` (frontend/mobile)

---

## Documentação da API

- **Swagger** habilitado quando `NODE_ENV !== "production"` em `/swagger`
- Tags documentadas em `src/index.ts`
- Referência detalhada de endpoints: `backend-parlare/RDA.md`
