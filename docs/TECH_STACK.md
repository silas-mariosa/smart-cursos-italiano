# TECH_STACK

Stack tecnológica factual de cada repositório do ecossistema Parlare / Manylingua.

---

## Visão geral

| Repositório | Runtime | Framework | Linguagem |
|-------------|---------|-----------|-----------|
| backend-parlare | Bun | Elysia.js | TypeScript |
| frontend-parlare | Bun/Node | Next.js 16 (App Router) | TypeScript |
| admin-parlare | Bun/Node | Next.js 16 (App Router) | TypeScript |
| mobile-parlare | Expo | Expo Router 6 + React Native | TypeScript |
| games-server | Bun | Elysia.js | TypeScript |

---

## backend-parlare

### Frameworks e runtime

- **Bun** — runtime e bundler
- **Elysia.js** — framework HTTP
- Plugins: `@elysiajs/cors`, `@elysiajs/cookie`, `@elysiajs/jwt`, `@elysiajs/swagger`

### Banco de dados

- **PostgreSQL** — driver `postgres`
- **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`)
- Migrations em `drizzle/migrations/` (43 arquivos SQL)
- Schema único em `src/drizzle/schema.ts`

### Autenticação

- JWT via `@elysiajs/jwt`
- Cookies httpOnly: `authTokenEasy`, `refreshTokenEasy`
- Hash de senha: `Bun.password.hash` / `Bun.password.verify`
- Google OAuth: `google-auth-library`

### Validação

- **Elysia guards** (`t.Object`, `t.String`, etc.) nas rotas
- **Zod v4** — validação de respostas da IA em `src/ai/schemas/`

### Serviços externos

| Serviço | Uso no código |
|---------|---------------|
| OpenAI-compatible API | Geração lazy de itens, TTS (`src/ai/`) |
| AWS S3 (`@aws-sdk/client-s3`) | Upload de áudio TTS (`src/storage/s3-public-upload.ts`) |
| SMTP / Nodemailer | E-mails transacionais (`src/components/templatEmails.ts`) |
| RevenueCat | Webhook de assinatura (`src/resource/subscription/`) |
| games-server | Cliente HTTP interno (`src/lib/games-server-client.ts`) |
| Expo Push | Notificações mobile (`src/resource/admin-push/`) |

### Infraestrutura

- Porta padrão: `4000`
- Swagger em ambiente não-production (`NODE_ENV !== "production"`)
- CORS para localhost:3000/3001, manylingua.com, admin-parlare.vercel.app

---

## frontend-parlare

### Frameworks

- **Next.js** 16.1.1 (App Router)
- **React** 19.2.3
- **TypeScript** ^5 (strict)

### UI e estilo

- **Tailwind CSS** ^4 (`@tailwindcss/postcss`)
- **shadcn/ui** (estilo `new-york`) — 56 componentes em `components/ui/`
- Primitivos: Radix UI, Base UI, cmdk, vaul, embla-carousel
- **lucide-react** — ícones
- **recharts** — gráficos
- **next-themes** + `ThemeBoot` custom
- Fonte: Plus Jakarta Sans

### Formulários e validação

- `react-hook-form` + `@hookform/resolvers` instalados
- `zod` no package.json (sem imports no código fonte atual)
- Padrão dominante: `useState` + forms nativos

### Integrações externas

| Serviço | Biblioteca / uso |
|---------|------------------|
| backend-parlare | `lib/api.ts` (ApiClient) |
| games-server | WebSocket (`hooks/use-games-realtime.tsx`), health/stats HTTP |
| RevenueCat | `@revenuecat/purchases-js` (`lib/subscription-rc-web.ts`) |
| Monetag | Anúncios recompensados (`public/sw.js`) |
| Google Analytics | GTM + GA4 hardcoded em `app/layout.tsx` |

### Infraestrutura

- Porta dev: `3000`
- `middleware.ts` — serve apenas `/app-ads.txt` (AdMob)
- Deploy documentado: Vercel (domínio manylingua.com)

---

## admin-parlare

### Frameworks

- **Next.js** 16.1.1 (App Router)
- **React** 19.2.3
- **TypeScript** ^5 (strict)

### UI e estilo

- **Tailwind CSS** ^4
- **shadcn/ui** (estilo `new-york`) — ~55 componentes
- **lucide-react**, **recharts**
- Cor de marca: verde `#58cc02`
- Tema padrão: dark

### Integrações

- Consome exclusivamente `backend-parlare` via `lib/api.ts`
- Porta dev: `3001`
- Deploy: Vercel (`admin-parlare.vercel.app`)

---

## mobile-parlare

### Frameworks

- **Expo SDK** ~54
- **Expo Router** ~6
- **React** 19.1, **React Native** 0.81.5
- **TypeScript** (strict)

### UI e estilo

- **NativeWind** (Tailwind 3)
- Tokens em `tailwind.config.js` e `lib/theme.ts`

### Estado e dados

- **TanStack React Query** v5 (`lib/react-query-client.ts`)
- **AsyncStorage** — preferências locais
- **expo-secure-store** — token JWT (iOS/Android)
- **Zustand** presente em `store/store.ts` (boilerplate, não usado)

### Integrações externas

| Serviço | Biblioteca |
|---------|------------|
| backend-parlare | `lib/api.ts` |
| games-server | WebSocket + HTTP health/stats |
| RevenueCat | `react-native-purchases` |
| AdMob | `react-native-google-mobile-ads` |
| Firebase | `@react-native-firebase/app` + analytics |
| Push | `expo-notifications` |
| OTA | `expo-updates` |
| Builds | EAS Build (`eas.json`) |

### Infraestrutura

- Bundle IDs: `com.mariosatech.parlaremobile`
- Versão atual: 1.4.0 (`app.json`)
- `runtimeVersion.policy: "appVersion"` para OTA

---

## games-server

### Frameworks e runtime

- **Bun**
- **Elysia** + WebSocket nativo
- Plugins: `@elysiajs/cors`, `@elysiajs/jwt`

### Cache e filas

- **ioredis** ^5.6 (suporta `rediss://`)
- Prefixo de chaves: `parlare:games:` (configurável)

### Infraestrutura

- Porta padrão: `4100`
- **Docker** (`Dockerfile` com `oven/bun:latest`)
- Health check: `GET /health`

---

## Ferramentas de desenvolvimento (comuns)

| Ferramenta | Repositórios |
|------------|--------------|
| ESLint | frontend, admin, mobile |
| Prettier | mobile |
| patch-package | mobile |
| Drizzle Studio | backend (`bun run db:studio`) |
| Swagger UI | backend (não-production) |

---

## Variáveis de ambiente principais

### backend-parlare

| Variável | Função |
|----------|--------|
| `DB_CONNECTION` | PostgreSQL (obrigatória) |
| `PORT` | Porta do servidor (default 4000) |
| `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `AI_MODEL` | Geração IA |
| `AWS_*` | S3 para áudio |
| `SMTP_*` | E-mail |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth |
| `CRON_SECRET` | Endpoints cron internos |
| `GAMES_SERVER_URL`, `GAMES_INTERNAL_API_KEY` | Integração games-server |
| `REVENUECAT_WEBHOOK_SECRET` | Webhook assinaturas |

### Clientes (frontend, admin, mobile)

| Variável | Função |
|----------|--------|
| `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL` | URL do backend |
| `NEXT_PUBLIC_GAMES_WS_URL` / `EXPO_PUBLIC_GAMES_WS_URL` | WebSocket games-server |
| `NEXT_PUBLIC_GAMES_HTTP_URL` / `EXPO_PUBLIC_GAMES_HTTP_URL` | HTTP games-server |
| `NEXT_PUBLIC_REVENUECAT_WEB_API_KEY` | RevenueCat web |
| `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_*` | AdMob mobile |

### games-server

| Variável | Função |
|----------|--------|
| `REDIS_URL` | Redis (obrigatória) |
| `JWT_SECRET` | Deve ser igual ao backend |
| `GAMES_INTERNAL_API_KEY` | Chamadas internas |
| `BACKEND_API_URL` | URL do backend (default localhost:4000) |
