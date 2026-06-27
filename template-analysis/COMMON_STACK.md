# COMMON_STACK

Stack tecnológica comum com evidências dos projetos de referência.

---

## Visão comparativa

| Camada | Balaio Criativo | Parlare/Manylingua | Decisão template |
|--------|-----------------|-------------------|------------------|
| Backend runtime | Bun | Bun | **Bun** |
| HTTP framework | Elysia | Elysia | **Elysia** |
| ORM | Drizzle 0.40 | Drizzle | **Drizzle** |
| DB | PostgreSQL | PostgreSQL | **PostgreSQL** |
| Web framework | Next.js 15 | Next.js 16 | **Next.js 16** (mais moderno) |
| React | 19.x | 19.2.x | **React 19** |
| Mobile | Expo 54 | Expo (parlare) | **Expo 54** |
| Router mobile | expo-router 6 | expo-router 6 | **expo-router 6** |
| Gerador mobile | scaffold manual | — | **Create Expo Stack (rn-new)** |
| CSS mobile | StyleSheet | — | **NativeWind v4.2.5** (`className`) |
| PM mobile | npm | — | **Bun** |
| CSS web | Tailwind 3/4 | Tailwind 4 | **Tailwind 4** |
| UI web | shadcn new-york | shadcn new-york | **shadcn new-york** |
| Estado mobile | React Query + Context | React Query + Context | **React Query + Context** |
| Auth backend | JWT + Bun.password | JWT + cookies httpOnly | **JWT + env secret** |
| Testes | bun:test (1 arquivo) | bun:test backend; jest mobile config | **bun:test** |

---

## Backend (evidências)

**Projetos:** `server-balaiocriativo`, `backend-parlare`

| Pacote | Versão ref. | Uso |
|--------|-------------|-----|
| `elysia` | latest / 1.2.x | Framework HTTP |
| `@elysiajs/cors` | ^1.2 | CORS |
| `@elysiajs/jwt` | ^1.2 | Autenticação JWT |
| `@elysiajs/swagger` | ^1.2 | Docs em dev |
| `@elysiajs/cookie` | — | Parlare: cookies httpOnly |
| `drizzle-orm` | ^0.40 | ORM |
| `drizzle-kit` | ^0.30 | Migrations |
| `postgres` | ^3.4 | Driver PG |
| `dotenv` | ^16.4 | Variáveis de ambiente |
| `elysia-rate-limit` | ^4.4 | Balaio: rate limit em rotas user |

**Scripts típicos:**
```json
"dev": "bun run --watch src/index.ts",
"start": "bun run src/index.ts",
"migrate": "bunx drizzle-kit migrate",
"generate": "bunx drizzle-kit generate"
```

**Evidência:** `package.json` em ambos backends; `TECH_STACK.md` em ambas docs.

---

## Frontend web (evidências)

**Projeto:** `frontend-parlare`

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next` | 16.1.1 | App Router |
| `react` / `react-dom` | 19.2.3 | UI |
| `tailwindcss` | ^4 | Estilos |
| `shadcn` | ^3.8.4 | CLI componentes |
| `radix-ui` / `@base-ui/react` | — | Primitivos |
| `class-variance-authority` | — | Variantes |
| `lucide-react` | — | Ícones |
| `next-themes` | — | Tema claro/escuro |
| `react-hook-form` + `zod` | — | Instalados, pouco usados |
| `sonner` | — | Toasts |

**Evidência:** `frontend-parlare/package.json`, `language-parlare/docs/TECH_STACK.md`

---

## Admin/CRM (evidências)

**Projeto:** `admin-parlare`

Mesma stack do frontend-parlare, acrescentando:
- `recharts` — gráficos no dashboard
- `date-fns`, `react-day-picker` — datas
- 56 componentes em `components/ui/`

Porta dev sugerida: **3001** (`RDA.md` admin).

---

## Mobile (evidências)

**Projeto template:** `mobile-curso-italiano`  
**Referência legada:** `mobile-balaioCriativo` (padrões de hooks/auth; sem NativeWind)

### Geração do projeto

```bash
npx rn-new@latest mobile-curso-italiano --expo-router --nativewind --no-git --bun
```

[Create Expo Stack](https://rn.new) (`rn-new`) — scaffolding oficial com expo-router, NativeWind e Bun.

### Decisão: rn-new + NativeWind v4

| Aspecto | Escolha | Motivo |
|---------|---------|--------|
| Gerador | **rn-new** | Pedido do usuário; CLI oficial do ecossistema Expo |
| Estilos | **NativeWind v4.2.5** | Setup oficial Tailwind no React Native (`global.css`, preset Babel/Metro via `withNativeWind`) |
| Alternativa descartada | Scaffold Expo manual | Sem integração NativeWind de fábrica; mais passos de configuração |

### Pacotes

| Pacote | Versão | Uso |
|--------|--------|-----|
| `expo` | ^54.0.0 | SDK |
| `react-native` | 0.81.5 | Runtime |
| `expo-router` | ~6.0.10 | Navegação file-based |
| `nativewind` | 4.2.5 (lock) | Tailwind via `className` |
| `tailwindcss` | ^3.4.0 | Config NativeWind |
| `@tanstack/react-query` | ^5.101.0 | Cache e mutations |
| `@react-native-async-storage/async-storage` | 2.2.0 | Token JWT |
| `jwt-decode` | ^4.0.0 | Payload do token |
| `zod` | ^3.24.1 | Validação |
| `jest-expo` | ~54.0.17 | Config de testes |

**Scripts típicos (Bun):**
```json
"start": "expo start",
"test": "jest"
```

**Padrões de código:**
- Auth: `AuthContext` + AsyncStorage (`"token"`)
- Dados remotos: hooks em `hooks/` com React Query (sem pasta `services/`)
- Estilos: `className` via NativeWind; componente `Screen` para layout

**Evidência:** `mobile-curso-italiano/package.json`, `mobile-curso-italiano/bun.lock`, `mobile-curso-italiano/README.md`

---

## Infraestrutura e DevOps

| Aspecto | Balaio backend | Parlare | Template |
|---------|---------------|---------|----------|
| Docker | `src/Dockerfile` (Bun) | games-server only | Dockerfile + compose |
| CI/CD | Ausente | Ausente | Documentado, não implementado |
| Deploy web | — | Vercel | Vercel-ready |
| Deploy mobile | EAS (`eas.json`) | EAS | `eas.json` base |
| Env example | Ausente backend | `.env.example` frontend | `.env.example` em todos |

---

## Integrações externas (NÃO incluídas nos templates)

Encontradas nos projetos reais, excluídas dos templates por serem regras de negócio:

- AWS S3, Nodemailer/SMTP, RevenueCat, Kiwify, Expo Push, OpenAI, Google OAuth, games-server WebSocket.

Templates expõem **interfaces genéricas** (config, logger) para futuras integrações.
