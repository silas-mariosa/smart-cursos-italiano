# CODE_PATTERNS

Convenções de código observadas no ecossistema Parlare / Manylingua.

---

## Convenções TypeScript

### Configuração comum

| Repositório | Config |
|-------------|--------|
| backend, frontend, admin, mobile, games-server | `strict: true` |
| Path alias | `@/*` → raiz do projeto (clientes web/mobile) |
| Target | ES2021+ (backend), ES2022 modules |

### Tipagem

| Padrão | Onde |
|--------|------|
| Tipos inferidos do schema Drizzle | `InferSelectModel`, `InferInsertModel` (backend) |
| Tipos de domínio centralizados | `lib/types.ts` (admin), exportados de `lib/api.ts` (frontend/mobile) |
| Guards Elysia | `t.Object`, `t.String` nas routes (backend) |
| Zod schemas | `src/ai/schemas/` (backend) |

### Nomenclatura

| Elemento | Convenção |
|----------|-----------|
| Tabelas/colunas DB | snake_case |
| Arquivos de recurso | `handler.ts`, `route.ts` |
| Pastas de domínio | kebab-case (`placement-test`, `admin-push`) |
| Componentes React | PascalCase |
| Hooks | `use-*` (kebab-case no arquivo) |
| Chaves localStorage | prefixo `parlare_*` ou `parlare_pref_*` |
| Mensagens de erro API | português (pt-BR) |

---

## Backend: handlers e routes

### Handler (`resource/*/handler.ts`)

```typescript
// Retorno padronizado
type Result<T> = { data: T | null; error: string | null };

export const minhaFuncao = async (params): Promise<Result<Tipo>> => {
  // queries Drizzle
  // retorna { data, error: null } ou { data: null, error: "mensagem" }
};
```

**Regras:**

- Não importar Elysia
- Importar `db` de `../../drizzle/db`
- Importar tabelas de `../../drizzle/schema`

### Route (`resource/*/route.ts`)

```typescript
export const meuRecurso = new Elysia({ prefix: "/recurso" })
  .post("/acao", async ({ body, headers, jwt }) => {
    const authToken = headers.authorization?.split(" ")[1];
    // jwt.verify, chamar handler, montar resposta
  }, { body: t.Object({ ... }) });
```

### Módulos auxiliares co-localizados

Arquivos `.ts` no mesmo domínio para lógica complexa:

| Arquivo | Domínio |
|---------|---------|
| `session-engine.ts` | study |
| `deck.ts` | study |
| `competition-week-ensure.ts` | competition |
| `notifications/service.ts` | notifications (único `service.ts` no backend) |

**Não há camada Repository** — queries diretas nos handlers.

---

## Clientes: ApiClient (`lib/api.ts`)

Presente em frontend, admin e mobile (~1600–1800 linhas cada).

### Estrutura

```typescript
class ApiClient {
  private baseUrl: string;

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    // headers, credentials, parse error, 401 → removeToken
  }

  // Métodos por domínio: signIn, getStudySession, getMe, ...
}

export const api = new ApiClient(API_BASE_URL);
```

### Token

```typescript
// Web
localStorage.getItem("authToken");
localStorage.setItem("authToken", token);

// Mobile
expo-secure-store (nativo) / AsyncStorage (web)
```

### Regra documentada (RDA.md)

> Proibido usar `fetch` ou `axios` fora de `lib/api.ts`.

---

## Hooks

### Custom hooks existentes

| Hook | Repositório | Função |
|------|-------------|--------|
| `use-mobile.ts` | admin, frontend | Breakpoint `< 768px` (sidebar) |
| `use-games-realtime.tsx` | frontend, mobile | WebSocket games-server, provider compartilhado |
| `use-push-notifications.ts` | mobile | Registro Expo push |
| `usePaymentInfo` | mobile | Info de pagamento RevenueCat |
| `use-games-language-bootstrap.ts` | mobile | Idioma da fila de jogos |

### Hooks de contexto

| Hook | Contexto |
|------|----------|
| `useApp()` | `AppContext` — user, stats, energia, competição (frontend) |
| `useUiLocale()` | `UiLocaleContext` — i18n UI |
| `useAuth()` | `AuthContext` — auth, hydrate (mobile) |

### Padrão de página (sem custom hooks de domínio)

```typescript
"use client";
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;
  api.getAlgo().then(...).catch(...);
  return () => { cancelled = true; };
}, [deps]);
```

**Não existem** hooks como `useUsers`, `useLanguages` — lógica fica nas páginas.

---

## Services

| Repositório | Camada services |
|-------------|-----------------|
| backend | Apenas `notifications/service.ts` |
| frontend/admin/mobile | **Ausente** — lógica em páginas + `lib/api.ts` |
| games-server | `services/backend-match-complete.ts`, `game-deck.ts`, `verify-rematch.ts`, `live-stats.ts`, `purge-user-data.ts` |

---

## Repositories

**Não utilizados** no ecossistema. Acesso a dados:

- Backend: handlers → `db` (Drizzle) diretamente
- Clientes: `api.*()` → HTTP → backend

---

## Helpers e utilitários

### Comuns

| Arquivo | Função |
|---------|--------|
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |
| `lib/conta/local-settings.ts` | Preferências em localStorage/AsyncStorage |
| `config/read-env.ts` (backend) | Trim de aspas em env vars |
| `lib/href.ts` (mobile) | Fallback de rotas tipadas |

### Backend específicos

| Arquivo | Função |
|---------|--------|
| `src/ai/persist-generated-items.helpers.ts` | Helpers de persistência IA (com testes) |
| `src/lib/games-server-client.ts` | Cliente HTTP para games-server |
| `src/lib/matchmaking-log.ts` | Log condicional de matchmaking |
| `src/components/templatEmails.ts` | Templates HTML de e-mail |
| `src/i18n/` | Locale de e-mails |

### Frontend/mobile específicos

| Arquivo | Função |
|---------|--------|
| `lib/i18n/interpolate.ts` | Interpolação de mensagens |
| `lib/onboarding-storage.ts` | Estado pré-cadastro |
| `lib/subscription-rc-web.ts` | Sync RevenueCat web |
| `lib/games/solo/*` | Lógica local de jogos solo |
| `lib/competition/mock/*` | Dados mock do protótipo |
| `config/dev-network.ts` (mobile) | Rewrite localhost → IP LAN / 10.0.2.2 |

---

## React Query (mobile)

```typescript
// lib/react-query-client.ts
staleTime: 60_000,
retry: 1,

// lib/query-keys.ts — chaves centralizadas
```

Usado para cache de dados servidor; web usa `useEffect` + estado local.

---

## games-server: modos plugáveis

```typescript
// modes/definition.ts
interface GameModeDefinition {
  createInitialState(deck): GameState;
  applyAction(state, action, playerId): GameState;
}

// modes/registry.ts — registro dos 4 modos
```

Cada modo em arquivo separado: `word-search.ts`, `fast-translation.ts`, `sentence-builder.ts`, `reaction-duel.ts`.

---

## Padrões de import

| Contexto | Padrão |
|----------|--------|
| Backend entre recursos | Caminhos relativos (`../../drizzle/db`) |
| Clientes | Alias `@/lib/api`, `@/components/ui/button` |
| games-server | ESM com extensão implícita via Bun |

---

## Idioma do código

| Aspecto | Idioma |
|---------|--------|
| Mensagens de erro API | pt-BR |
| UI admin | pt-BR fixo |
| UI frontend/mobile | pt-BR default + 4 locales adicionais |
| Comentários no código | predominantemente pt-BR |
| Nomes de variáveis/funções | inglês |
