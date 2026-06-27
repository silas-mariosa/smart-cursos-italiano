# COMMON_PATTERNS

Padrões recorrentes identificados com evidências.

---

## Autenticação

### Backend

| Padrão | Evidência |
|--------|-----------|
| JWT via `@elysiajs/jwt` | `src/jwt/jwt.ts` ambos backends |
| Hash senha `Bun.password.hash/verify` | `auth/handler.ts` |
| Claims JWT: id, nome, email/role | Balaio: `auth_ID`; Parlare: `role` |
| Cookie httpOnly opcional | Balaio `authTokenEasy`, Parlare `authTokenEasy` + refresh |
| Verificação por rota | `headers.authorization?.split(" ")[1]` + `jwt.verify()` |

**Template:** Helper centralizado `verifyBearerToken()` + secret via `JWT_SECRET` env.

### Frontend web

| Padrão | Evidência |
|--------|-----------|
| Token em `localStorage.authToken` | `frontend-parlare/lib/api.ts` |
| `ApiClient.signIn()` persiste token | idem |
| 401 → `removeToken()` | idem |
| `AppContext` com `checkAuth()` via `getMe()` | `AppContext.tsx` |
| Guard client-side no shell | `authenticated-shell.tsx` |

### Mobile

| Padrão | Evidência |
|--------|-----------|
| Token em AsyncStorage chave `"token"` | `tokenContext.tsx` |
| `jwtDecode` para payload | idem |
| Redirect se `!token` no layout dashboard | `dashboard/_layout.tsx` |
| Bearer em hooks | `hooks/card/getStickers.ts` |

### Admin/CRM

| Padrão | Evidência |
|--------|-----------|
| Login → valida admin via `getAdminStats()` | `admin-parlare/app/login/page.tsx` |
| RBAC: `role === "admin"` no backend | `SECURITY_PATTERNS.md` Parlare |
| Sem middleware Next.js | Ausência de `middleware.ts` no admin |

---

## API

### Backend

```typescript
// Validação Elysia
.guard({ body: t.Object({ email: t.String(), password: t.String() }) })

// Retorno handler
return { data: result, error: null };
return { data: null, error: "mensagem pt-BR" };
```

**Evidência:** `API_PATTERNS.md` Balaio, `route.ts` em múltiplos módulos.

### Clientes web

```typescript
// lib/api.ts — classe única
class ApiClient {
  private async request<T>(endpoint, options) {
    const token = this.getToken();
    // fetch com Authorization Bearer
  }
}
export const api = new ApiClient(API_BASE_URL);
```

**Regra:** Proibido `fetch` fora de `lib/api.ts` (RDA Parlare).

### Mobile

```typescript
// hooks/useExample.ts
export function useExample() {
  return useQuery({
    queryKey: ["example"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/endpoint`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}
```

---

## Estado

| Projeto | Padrão |
|---------|--------|
| Frontend Parlare | React Context (`AppContext`, `UiLocaleContext`) |
| Admin Parlare | `useState` + `useEffect` por página |
| Mobile Balaio | Context (auth, tema) + TanStack React Query |
| Balaio CRM web | React Query |

**Ausente em todos:** Redux, Zustand, Jotai.

---

## Formulários e validação

| Projeto | Padrão dominante |
|---------|------------------|
| Backend | Elysia `t.*` guards |
| Frontend/Admin | `useState` + `<form onSubmit>` nativo |
| Mobile | `useState` + validação manual; `zod` instalado |
| Instalado mas subutilizado | `react-hook-form` + `zod` + `@hookform/resolvers` |

**Decisão template:** Manter RHF+zod instalados; exemplos com forms nativos (padrão predominante).

---

## i18n

**Encontrado apenas em `frontend-parlare`:**
- Sistema custom: `lib/i18n/ui-locale.ts`, `messages.ts`, `UiLocaleContext`
- Locales: pt-BR, en-US, it-IT, fr-FR, es-ES
- Storage: `parlare_ui_locale`

**Mobile e admin:** textos hardcoded pt-BR.

**Decisão template:** i18n no frontend-curso-italiano; pt-BR fixo no CRM e mobile.

---

## Error handling

### Backend (observado)

- `handleErrorResponse()` duplicado em vários `route.ts` (Balaio)
- `set.status = 4xx/5xx` ou `error(400, ...)`
- Handlers retornam `{ data, error }` sem throw

### Template (melhoria)

- `src/lib/errors.ts` — `AppError`, `handleRouteError()`
- `src/lib/logger.ts` — logging estruturado mínimo

---

## Database

| Padrão | Evidência |
|--------|-----------|
| Schema único `src/drizzle/schema.ts` | Ambos backends |
| Migrations em `drizzle/` | SQL files + meta |
| `prepare: false` no driver postgres | `db.ts` Balaio |
| Soft delete parcial (`deletedAt`) | Balaio schema |
| UUID PK | Parlare rules |

---

## DevOps

| Padrão | Evidência |
|--------|-----------|
| Docker backend Bun | `src/Dockerfile` |
| Swagger só em dev | `NODE_ENV !== "production"` |
| CORS configurável | `origin: "*"` Balaio; whitelist Parlare |
| EAS mobile | `eas.json` profiles |
| Vercel web | `vercel.json` frontend |

---

## Testes

| Projeto | Setup |
|---------|-------|
| Backend Balaio | `bun:test` — 1 arquivo webhook |
| Backend Parlare | `bun:test` — alguns testes |
| Mobile | `jest-expo` configurado, 0 testes |
| Frontend/Admin | Apenas ESLint |

**Padrão template:** `bun:test` no backend; estrutura de teste documentada nos demais.
