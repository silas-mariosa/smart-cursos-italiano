# ANTI_PATTERNS

O que evitar — baseado em problemas encontrados nos projetos reais.

---

## Segurança

| Anti-pattern | Evidência | Correção no template |
|--------------|-----------|---------------------|
| JWT secret hardcoded | `src/jwt/jwt.ts` Balaio: `secret: "@Wfbmprt8"` | `JWT_SECRET` em env |
| Webhook secrets hardcoded | `payment/route.ts` Balaio | Env vars documentadas |
| SMTP creds no código | `templatEmails.ts` | Não incluir; usar env |
| CORS `origin: "*"` em produção | `src/index.ts` Balaio | CORS configurável via env |
| `.env` não no gitignore raiz | Balaio `.gitignore` | `.env` no gitignore |
| API keys mobile hardcoded | `RevenueCatPriveder.tsx` | `EXPO_PUBLIC_*` env |

---

## Arquitetura

| Anti-pattern | Evidência | Correção |
|--------------|-----------|----------|
| `handleErrorResponse` duplicado em N routes | 8+ arquivos Balaio | `lib/errors.ts` centralizado |
| Auth JWT copy-paste por rota | Todos `route.ts` Balaio | `lib/auth.ts` helper |
| Lógica de negócio em `route.ts` | Ocasional | Separar em `handle.ts` |
| `fetch` espalhado nos clientes | Violação RDA Parlare | Apenas `lib/api.ts` |
| Dois `QueryClientProvider` aninhados | `mobile _layout.tsx` + `dashboard/_layout.tsx` | Um provider no root |
| `FontProvider` definido mas não montado | `FontContext.tsx` Balaio | Montar ou remover |

---

## Código

| Anti-pattern | Evidência | Correção |
|--------------|-----------|----------|
| `any` em handlers de erro | Vários `route.ts` | Tipar erros |
| Naming inconsistente `handle` vs `handler` | `auth/handler.ts` Balaio | Padronizar `handle.ts` |
| `console.log` de credenciais | `admin-parlare/lib/api.ts` signIn | Remover logs sensíveis |
| Dependência instalada sem uso | `@supabase/supabase-js` Balaio | Não incluir no template |
| `index.js` órfão referenciando `App` | `mobile-balaioCriativo/index.js` | Usar apenas expo-router entry |
| README padrão create-next-app | frontend/admin Parlare | README descritivo no template |

---

## Testes e qualidade

| Anti-pattern | Evidência | Correção |
|--------------|-----------|----------|
| Script test que sempre falha | Balaio backend `"test": "echo Error..."` | `bun test` funcional |
| jest configurado, zero testes | mobile-balaioCriativo | Incluir 1 teste exemplo |
| Sem CI em nenhum repo | Ausência `.github/workflows` | Documentar setup futuro |
| Sem ESLint no backend Balaio | Ausência configs | Incluir no template |

---

## UX e produto

| Anti-pattern | Evidência | Nota |
|--------------|-----------|------|
| Toaster instalado mas não montado | `sonner.tsx` frontend Parlare | Montar `<Toaster />` no layout |
| Proteção auth só client-side | admin/frontend Parlare | Documentar limitação; considerar middleware em produção |
| Base URL API hardcoded mobile | `config/url.ts` Balaio | Usar env/config |

---

## Database

| Anti-pattern | Evidência | Correção |
|--------------|-----------|----------|
| `db:push` em produção | Parlare rules: apenas dev | Documentar migrate-only em prod |
| Integer auto-increment PK | Proibido em Parlare rules | UUID em template |
| Múltiplos plugins `/admin` | Parlare rules | Um único prefix `/admin` |

---

## Resumo para templates

Os templates devem **corrigir** os anti-patterns de segurança e duplicação, **manter** os padrões arquiteturais que funcionam (route+handle, api centralizado), e **documentar** limitações intencionais (auth client-side, sem CI).
