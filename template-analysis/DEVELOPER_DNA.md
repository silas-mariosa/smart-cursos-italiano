# DEVELOPER_DNA

Identidade técnica consolidada a partir dos projetos de referência Balaio Criativo e Parlare/Manylingua.

**Fontes:** `server-balaiocriativo`, `mobile-balaioCriativo`, `frontend-parlare`, `admin-parlare`, docs em `BALAIO CRIATIVO/docs` e `language-parlare/docs`.

---

## Filosofia de código

1. **Pragmatismo sobre abstração** — Handlers com queries Drizzle diretas; sem camada repository/service nos backends (`ARCHITECTURE.md` Balaio, `PROJECT_RULES.md` Parlare).
2. **Monólito modular por feature** — Uma pasta = um domínio com `route.ts` + `handle.ts` (ou `handler.ts`).
3. **Cliente HTTP centralizado** — `lib/api.ts` único nos frontends web/admin; mobile usa hooks + `fetch` com React Query.
4. **TypeScript strict nos projetos maduros** — `strict: true` em backend e Parlare; path alias `@/*` nos clientes.
5. **Infraestrutura mínima** — Sem ESLint no backend Balaio; testes automatizados quase ausentes; foco em entrega funcional.
6. **Mensagens em pt-BR** — Erros de API, UI admin e default do frontend em português.

---

## Convenções de nomenclatura

| Contexto | Convenção | Evidência |
|----------|-----------|-----------|
| Tabelas/colunas DB | snake_case | `schema.ts` ambos backends |
| IDs principais | UUID texto (`crypto.randomUUID()`) | Parlare `PROJECT_RULES.md` |
| Rotas HTTP | kebab-case ou camel em prefixos | `/auth`, `/user`, `/admin/users` |
| Arquivos backend | `route.ts` + `handle.ts` | 17 módulos Balaio, N recursos Parlare |
| Componentes React | PascalCase | `AuthenticatedShell`, `ModernTabBar` |
| Hooks | camelCase com prefixo `use` | `useFavorit`, `use-mobile` |
| localStorage | Prefixo de projeto em Parlare (`parlare_*`) | `parlare_ui_locale`, `authToken` |
| Mobile token | Chave `"token"` em AsyncStorage | `tokenContext.tsx` Balaio |

---

## Organização mental do desenvolvedor

```
Backend (Elysia)     → resource/<feature>/route.ts + handle.ts
Frontend (Next.js)   → app/(grupos)/ + lib/api.ts + components/
Mobile (Expo)        → app/ + hooks/ + context/ + config/
Admin/CRM (Next.js)  → app/dashboard/ + lib/api.ts + sidebar
```

---

## Decisões de estilo

- **Result-like nos handlers:** `{ data, error }` em vez de throw (padrão dominante Balaio).
- **Auth por rota:** JWT verificado inline ou via helper local; sem middleware global no backend Balaio.
- **Forms web:** `useState` + forms nativos dominam; `react-hook-form` + `zod` instalados mas subutilizados (Parlare).
- **Estado global leve:** React Context para auth/tema/locale; sem Redux/Zustand nos projetos web.
- **Mobile:** Context para auth + TanStack React Query para dados remotos.

---

## O que NÃO fazer (DNA negativo)

- Não criar camadas repository/service sem necessidade.
- Não espalhar `fetch` fora de `lib/api.ts` nos clientes web (regra RDA Parlare).
- Não hardcodar secrets em produção (anti-pattern encontrado em JWT Balaio — templates corrigem via env).
- Não misturar lógica de negócio em `route.ts`.

---

## Runtime preferido

| Camada | Escolha predominante |
|--------|---------------------|
| Backend | **Bun** (ambos backends) |
| Web | **Bun/Node** com Next.js |
| Mobile | **Expo SDK 54** + dev client |
| Deploy backend | Docker (`oven/bun`) |
| Deploy web | Vercel |

---

## Idioma e comunicação

- Comentários e docs internos: pt-BR predominante.
- Commits: sem padrão rígido observado; mensagens descritivas em português ou inglês técnico.
- README de projeto: frequentemente template padrão (`create-next-app`) — documentação real está em `RDA.md` e `docs/`.
