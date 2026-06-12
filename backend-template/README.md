# Backend Template

API base em **Bun + Elysia + Drizzle + PostgreSQL**, derivada dos padrões de `server-balaiocriativo` e `backend-parlare`.

## Stack

- Runtime: Bun
- Framework: Elysia 1.x
- ORM: Drizzle ORM + PostgreSQL
- Auth: JWT (`@elysiajs/jwt`) + `Bun.password`
- Validação: Elysia guards (`t.Object`)
- Docs: Swagger (apenas fora de produção)

## Arquitetura

```
src/
├── config/env.ts       # Variáveis validadas
├── jwt/                # Plugin JWT
├── lib/                # Logger, errors, auth helpers, result
├── drizzle/            # db, schema, seed
└── resource/
    ├── auth/           # signup, signin, me
    ├── admin/          # stats, users, RBAC
    └── health/         # health check
```

Padrão **route.ts + handle.ts**: rotas HTTP separadas da lógica de negócio.

## Convenções

- Handlers retornam `{ data, error }`
- JWT secret via `JWT_SECRET` (não hardcoded)
- Mensagens de erro em pt-BR
- UUID como PK; soft delete com `deleted_at`

## Início rápido

```bash
cp .env.example .env
# Subir PostgreSQL (docker compose up db -d)
bun install
bun run migrate
bun run seed
bun run dev
```

API em `http://localhost:4000`. Swagger em desenvolvimento.

**Admin seed:** `admin@template.local` / `admin123` (configurável via `SEED_ADMIN_*`).

## Scripts

| Script | Descrição |
|--------|-----------|
| `dev` | Servidor com watch |
| `migrate` | Aplica migrations |
| `seed` | Cria admin inicial |
| `test` | Testes bun:test |
| `studio` | Drizzle Studio |

## Docker

```bash
docker compose up --build
```
