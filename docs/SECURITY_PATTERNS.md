# SECURITY_PATTERNS

Padrões de segurança observados no código do ecossistema Parlare / Manylingua.

---

## Autenticação (Auth)

### Mecanismo

| Aspecto | Implementação |
|---------|---------------|
| Protocolo | JWT (JSON Web Token) |
| Plugin | `@elysiajs/jwt` em backend e games-server |
| Transporte REST | Header `Authorization: Bearer <token>` |
| Cookies | `authTokenEasy`, `refreshTokenEasy` (httpOnly) via `@elysiajs/cookie` |
| Payload JWT | Contém `userId` |
| Hash de senha | `Bun.password.hash` / `Bun.password.verify` |

### Configuração JWT

```typescript
// backend-parlare/src/jwt/jwt.ts
export const JWT = jwt({
  name: "jwt",
  secret: "@Wfbmprt8",  // hardcoded — não lê de variável de ambiente
});
```

games-server usa `JWT_SECRET` via env (deve ser igual ao backend).

### Fluxos de autenticação

| Fluxo | Endpoint / comportamento |
|-------|--------------------------|
| Cadastro | `POST /auth/signup` → código de verificação por e-mail |
| Verificação | `POST /auth/verify-email` (código 6 dígitos, TTL 15 min) |
| Login | `POST /auth/signin` → JWT + refresh token |
| Refresh | Cookie `refreshTokenEasy` |
| Google OAuth | `google-auth-library`; `google_id`, `avatar_url`; `password` nullable |
| Recuperação senha | Reutiliza `email_verification_code` |
| Exclusão conta | Soft delete (`auth.deleted_at`); purge de dados |

### Armazenamento do token nos clientes

| Cliente | Storage |
|---------|---------|
| frontend-parlare | `localStorage.authToken` |
| admin-parlare | `localStorage.authToken` |
| mobile-parlare | `expo-secure-store` (iOS/Android), AsyncStorage (web) |

### Refresh tokens

- Armazenados em **`Map` em memória** (`refreshTokensStore` em `auth/handler.ts`)
- **Não persistidos** no banco de dados
- Perdem-se ao reiniciar o processo do backend

### WebSocket (games-server)

- JWT passado como query string: `WS /ws?token=<JWT>`
- Validação: `jwt.verify(token)`; exige `userId` no payload
- Falha: `{ type: "error", code: "auth" }` + close

---

## Roles

### Enum `role` (PostgreSQL)

| Valor | Acesso |
|-------|--------|
| `user` | frontend-parlare, mobile-parlare |
| `admin` | admin-parlare |

Definido em `roleEnum` em `src/drizzle/schema.ts`.

### Verificação de admin

Função `getAdminProfile()` em `src/middleware/admin-auth.ts`:

1. Verifica presença do token
2. `jwt.verify(authToken)` → extrai `userId`
3. Query ao banco: `auth.role === "admin"`
4. Retorna `{ profile }` ou `{ error }`

**Dupla verificação:** JWT válido + role no banco.

### Login admin (admin-parlare)

1. `api.signIn()` → `setToken()`
2. `api.getAdminStats()` — valida perfil admin
3. Se falhar: `removeToken()` e erro

---

## Permissões e status de usuário

### Enum `user_status`

| Valor | Uso |
|-------|-----|
| `free` | Usuário gratuito |
| `premium` | Assinante |
| `testador` | Status especial para testes |

Usado em regras de negócio (placement test, recursos premium, etc.) — verificação nos handlers.

### Endpoints por nível de acesso

| Nível | Exemplos |
|-------|----------|
| Público | `/auth/signup`, `/auth/signin`, `GET /app-version/`, `GET /content/languages` |
| Autenticado (JWT) | `/study/*`, `/progress/*`, `/social/*`, `/gamification/*` |
| Admin (JWT + role) | `/admin/*`, `PUT /app-version`, `POST /learning-items/audio/sync` |
| Cron interno | `x-cron-secret` header |
| Games interno | `x-games-internal-key` header |
| Webhook | `REVENUECAT_WEBHOOK_SECRET` (opcional) |

---

## Middleware

### Backend

| Arquivo | Função | Uso atual |
|---------|--------|-----------|
| `middleware/auth.ts` | `authMiddleware` (Elysia derive) | **Definido mas não importado/usado** em outros arquivos |
| `middleware/admin-auth.ts` | `getAdminProfile()` | Usado nas routes admin |

**Padrão dominante:** extração manual do token nas routes:

```typescript
const authToken = headers.authorization?.split(" ")[1];
const payload = await jwt.verify(authToken);
```

### Clientes (frontend, admin)

| Aspecto | Implementação |
|---------|---------------|
| Next.js middleware | **Ausente** para auth (frontend: apenas `app-ads.txt`; admin: nenhum) |
| Proteção de rotas | **100% client-side** |
| frontend | `AuthenticatedShell`: `!user` → redirect `/home` |
| admin | `dashboard/layout.tsx`: sem token → `/login` |
| mobile | `(app)/_layout.tsx`: redirect login/onboarding |
| 401 da API | `removeToken()` automático no `ApiClient` |

### CORS (backend)

```typescript
origin: [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.manylingua.com",
  "https://manylingua.com",
  "https://admin-parlare.vercel.app",
],
credentials: true,
```

### CORS (games-server)

Configurável via `CORS_ORIGINS` (default localhost:3000/3001).

---

## Segredos e chaves internas

| Variável | Header | Protege |
|----------|--------|---------|
| `CRON_SECRET` | `x-cron-secret` | Endpoints cron (`/invites/internal/run`, `/competition/internal/close-weeks`, `/messages/internal/run`) |
| `GAMES_INTERNAL_API_KEY` | `x-games-internal-key` | `/games/internal/*` (backend), `/internal/*` (games-server) |
| `REVENUECAT_WEBHOOK_SECRET` | — | Webhook RevenueCat (se vazio, aceita qualquer request) |
| `INVITE_UNSUBSCRIBE_SECRET` | — | Tokens de descadastro de convites |

---

## Outras medidas observadas

| Medida | Detalhe |
|--------|---------|
| Soft delete | `auth.deleted_at` em exclusão de conta |
| Purge LGPD | games-server `POST /internal/users/:userId/purge` |
| Verificação de e-mail | Obrigatória para cadastro email/senha |
| Códigos temporários | `email_verification_code` com `expiresAt` |
| Auditoria IA | `openai_request_logs` sem chaves de API |
| Logs de erro | `backend_error_logs` sem segredos em `context` |
| SEO admin | `robots: { index: false, follow: false }` |
| Sanitização games | `toPublicMatchState()` omite dados sensíveis do estado do jogo |

---

## Observações factuais (presentes no código)

| Item | Estado |
|------|--------|
| JWT secret hardcoded | `src/jwt/jwt.ts` — não lê de env |
| `.env.exemple` versionado | Contém credenciais de exemplo |
| Refresh tokens em memória | Perdem-se ao restart |
| Proteção de rotas client-side | Token visível em localStorage (web) |
| `authMiddleware` | Não utilizado |
| Admin sem refresh token | `refreshToken` retornado no login mas não armazenado/usado |
| `console.log` no signIn admin | Loga email/password |
