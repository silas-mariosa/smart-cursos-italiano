# Frontend Template

App web em **Next.js 16 (App Router) + Tailwind 4**, baseado em `frontend-parlare`.

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- Componentes UI minimalistas (padrão shadcn new-york)
- Auth: JWT em `localStorage` via `lib/api.ts`
- i18n custom (pt-BR / en-US) — padrão Parlare

## Arquitetura

```
app/
├── (public)/auth/login   # Rotas públicas
└── (app)/dashboard       # Rotas autenticadas
components/layout/        # AuthenticatedShell, PublicShell
lib/
├── api.ts                # Cliente HTTP único (obrigatório)
├── context/              # AppContext, UiLocaleContext
└── i18n/                 # Mensagens e locale
```

## Convenções

- **Proibido** `fetch` fora de `lib/api.ts`
- Proteção de rotas via shell client-side
- Forms nativos + `useState` (padrão predominante nos refs)
- Path alias `@/*`

## Início rápido

```bash
cp .env.example .env.local
bun install
bun run dev
```

Configure `NEXT_PUBLIC_API_URL` apontando para o backend-curso-italiano.

## Extensão

1. Adicionar rotas em `app/(app)/` ou `app/(public)/`
2. Novos métodos em `lib/api.ts`
3. Componentes shadcn: `npx shadcn@latest add <component>`
