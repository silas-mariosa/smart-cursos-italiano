# CRM Template

Painel administrativo SaaS em **Next.js 16**, baseado em `admin-parlare`.

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- Auth JWT client-side + validação admin via `/admin/stats`
- RBAC: roles `user` | `admin`

## Módulos genéricos

- Dashboard (estatísticas)
- Usuários (listagem, busca, alteração de role)
- Perfil do admin logado
- Login com gate de administrador

## Arquitetura

```
app/
├── login/
└── dashboard/
    ├── layout.tsx        # Sidebar + auth guard
    ├── page.tsx          # Overview
    ├── usuarios/
    └── perfil/
lib/api.ts                # Cliente HTTP único
components/layout/        # DashboardShell
```

## Convenções

- Porta dev: **3001** (padrão admin-parlare)
- `fetch` apenas em `lib/api.ts`
- Proteção 100% client-side (sem middleware Next.js)
- UI em pt-BR

## Início rápido

```bash
cp .env.example .env.local
bun install
bun run dev
```

Use credenciais do admin criado pelo `backend-curso-italiano` seed.

## Extensão

Novos módulos admin: adicionar rotas em `app/dashboard/` e endpoints em `lib/api.ts` + `backend-curso-italiano/src/resource/admin/`.
