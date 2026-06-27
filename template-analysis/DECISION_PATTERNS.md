# DECISION_PATTERNS

Como decisões técnicas são tomadas nos projetos e critérios para os templates.

---

## Hierarquia de prioridade (instrução do template)

Quando há divergência entre projetos:

1. **Padrão mais frequente** entre os 4 repositórios
2. **Mais moderno** (ex.: Next 16 > Next 15, Tailwind 4 > 3)
3. **Mais escalável** (ex.: env vars > hardcode, helper auth centralizado > copy-paste)

Todas as decisões abaixo documentam a evidência e a escolha.

---

## Decisões de stack

| Decisão | Escolha | Motivo | Evidência |
|---------|---------|--------|-----------|
| Runtime backend | Bun | 100% dos backends | `package.json` ambos |
| Framework HTTP | Elysia | 100% dos backends | idem |
| ORM | Drizzle + PostgreSQL | 100% | `drizzle.config.ts` |
| Framework web | Next.js 16 App Router | Parlare mais recente | `frontend-parlare` 16.1.1 vs Balaio 15 |
| UI kit | shadcn new-york | Ambos ecossistemas web | `components.json` |
| CSS | Tailwind 4 | Parlare (mais moderno) | `postcss.config.mjs` |
| Mobile | Expo 54 + expo-router 6 + NativeWind v4 | Balaio (Expo/router); template via rn-new | `mobile-curso-italiano/package.json` |
| Scaffold mobile | rn-new (Create Expo Stack) | Pedido do usuário + setup oficial NativeWind no RN | `mobile-curso-italiano/README.md` |
| CSS mobile | NativeWind v4 (`className`) | Tailwind no RN; integrado de fábrica pelo rn-new | `global.css`, `tailwind.config.js` |
| PM mobile | Bun | Alinhado ao backend; flag `--bun` do rn-new | `mobile-curso-italiano/package.json` |
| Estado mobile | React Query + Context | Balaio + docs Parlare mobile | `hooks/`, `reactQueryClient.ts` |

---

## Decisões de arquitetura

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Camada service/repository | **Não** | Ausente em todos backends; YAGNI |
| Auth dual (admin+user) vs unificado | **Unificado com RBAC** | Mais escalável; Parlare já usa `role` |
| Middleware auth backend global | **Helper reutilizável** | Melhoria sobre copy-paste Balaio |
| JWT secret | **Env `JWT_SECRET`** | Anti-pattern hardcode em Balaio |
| Rotas admin | **Prefixo `/admin`** centralizado | Parlare `PROJECT_RULES.md` |
| API client único | **lib/api.ts** | Regra RDA explícita |
| i18n | **Custom no frontend only** | Único local com implementação real |

---

## Decisões de auth nos clientes

| Cliente | Storage | Motivo |
|---------|---------|--------|
| Frontend template | localStorage `authToken` | Padrão Parlare frontend |
| CRM template | localStorage `authToken` | Padrão admin-parlare |
| Mobile template | AsyncStorage `"token"` | Padrão mobile-balaioCriativo |

Cookie httpOnly documentado como alternativa (Balaio CRM, Parlare backend) mas não adotado nos templates web para simplificar SSR.

---

## Decisões de qualidade

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| ESLint | **Incluir** nos templates web | Parlare tem; Balaio não — escolhemos o mais completo |
| Prettier | **Incluir** | Ausente nos refs; melhoria para templates |
| CI/CD | **Documentar, não implementar** | Ausente em todos os refs |
| Testes | **Estrutura mínima** | Refs têm quase zero testes |

---

## Decisões de nomenclatura

| Item | Escolha | Evidência |
|------|---------|-----------|
| Handler file | `handle.ts` | Maioria Balaio (exceto auth) |
| Tabela users | `users` com snake_case cols | Parlare pattern |
| Env backend | `DB_CONNECTION`, `JWT_SECRET`, `PORT` | Vars encontradas no código |
| Env frontend | `NEXT_PUBLIC_API_URL` | Parlare `.env.example` |

---

## O que foi explicitamente excluído

| Item | Motivo |
|------|--------|
| Entidades Balaio (stickers, categories) | Regra de negócio |
| Entidades Parlare (learning items, gamification) | Regra de negócio |
| RevenueCat, S3, SMTP, OpenAI | Integrações específicas |
| games-server | Serviço separado Parlare |
| Dual auth Balaio (/user vs /auth) | Simplificado para RBAC único |

---

## Processo de evolução observado

1. Novo domínio → nova pasta em `resource/`
2. Alteração schema → `drizzle-kit generate` → `migrate`
3. Novo endpoint admin → adicionar em `resource/admin/route.ts` (Parlare)
4. Novo componente UI → `shadcn add` ou cópia em `components/ui/`
5. Deploy backend → build Docker Bun
6. Deploy web → Vercel (push branch)
