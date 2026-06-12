# UI_PATTERNS

Padrões de interface observados em `frontend-parlare`, `admin-parlare` e `mobile-parlare`.

---

## Design System

### Web (frontend + admin)

| Aspecto | Implementação |
|---------|---------------|
| Base | **shadcn/ui** estilo `new-york` |
| Config | `components.json` na raiz de cada projeto |
| Tokens | CSS variables em `app/globals.css` (oklch) |
| Utilitário de classes | `cn()` em `lib/utils.ts` (`clsx` + `tailwind-merge`) |
| Ícones | **lucide-react** |
| Tema | `next-themes` + `ThemeBoot` custom |
| Preferência local | `localStorage` chave `parlare_pref_theme` |
| Alias de import | `@/components`, `@/lib`, `@/hooks` |

### Cores e identidade

| Projeto | Detalhe |
|---------|---------|
| frontend-parlare | Tokens `--brand`, gradientes em `ParlareAtmosphere` |
| admin-parlare | Verde de marca `#58cc02`; tema padrão **dark** |
| mobile-parlare | Tokens em `tailwind.config.js` e `lib/theme.ts` (NativeWind) |

### Fonte (web)

- **Plus Jakarta Sans** via `next/font/google` (frontend)

### i18n de interface

| Projeto | Locales |
|---------|---------|
| frontend-parlare | `pt-BR`, `en-US`, `it-IT`, `fr-FR`, `es-ES` via `lib/i18n/messages.ts` |
| admin-parlare | pt-BR fixo |
| mobile-parlare | Mesmo sistema do frontend (`UiLocaleContext`) |

Função `t("chave")` via `useUiLocale()`.

---

## Componentes reutilizáveis

### shadcn/ui (`components/ui/`)

Presentes em frontend (~56) e admin (~55):

| Categoria | Componentes usados nas páginas de negócio |
|-----------|-------------------------------------------|
| Layout | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription` |
| Dados | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` |
| Formulário | `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Button` |
| Feedback | `Alert`, `Skeleton`, `Badge`, `Progress` |
| Overlay | `Dialog`, `AlertDialog` |
| Navegação | `Sidebar`, `SidebarProvider`, `ScrollArea` |
| Gráficos | `ChartContainer` + recharts |

**Instalados mas pouco usados nas páginas de negócio:**

- `Sheet`, `Drawer` (admin)
- `Form` (react-hook-form wrapper)
- `Toaster`/sonner (componente existe; frontend monta Toaster; admin **não** monta em layout)

### Componentes de domínio (frontend)

| Pasta | Responsabilidade |
|-------|------------------|
| `components/layout/` | `authenticated-shell`, `public-shell`, `app-page-canvas`, `parlare-atmosphere` |
| `components/study/` | Sessão de estudo (`dashboard-study-experience.tsx`) |
| `components/review/` | Fila de revisão, gráficos XP |
| `components/placement-test/` | Runner do teste de nivelamento |
| `components/games/` | Sessões solo/live, lobby, toolbar WS |
| `components/competition/` | HUD do protótipo de competição |
| `components/social/` | Diálogos de usuário |
| `components/conta/` | Tema, formulários de idiomas |
| `components/gamification/` | Cards de estatísticas |

### Componentes de domínio (mobile)

| Pasta | Responsabilidade |
|-------|------------------|
| `components/games/` | Hub, telas de partida, solo |
| `components/study/` | Sessão de estudo |
| `components/progresso/` | Progresso |
| `components/perfil/` | Perfil |
| `components/social/` | Social |
| `components/mandatory-app-update-modal.tsx` | Bloqueio por versão mínima |

---

## Estrutura de layouts

### frontend-parlare

```
Root layout (providers)
├── (public)/ → PublicShell (tema claro forçado em auth)
└── (app)/ → AuthenticatedShell (sidebar colapsável)
    ├── conta/ → ContaSettingsLayout
    └── games/prototipo/ → GamesRealtimeProvider
```

**Comportamentos:**

- Sidebar oculta durante sessão de estudo ativa (evento `parlare-study-phase-change`)
- Sidebar oculta em partidas `/games/prototipo/*/partida/[matchId]`
- Páginas internas: `AppPageStandardShell` + `AppPageCanvas`
- Badge **BETA** no logo

### admin-parlare

```
Root layout (ThemeBoot)
├── /login (pública)
└── /dashboard → SidebarProvider + sidebar colapsável
    ├── conteudo/ → sub-nav horizontal (Idiomas | Categorias | Temas | Itens | Áudio)
    └── gamificacao/ → sub-nav (Badges | Missões)
```

Header sticky com título dinâmico e botão "Ação rápida" → novo item.

### mobile-parlare

```
Root (_layout.tsx) → providers encadeados
├── (public)/ → landing
├── (auth)/ → login, register, onboarding
└── (app)/ → Stack
    └── (tabs)/ → 6 abas: início, progresso, competição, jogos, social, perfil
```

---

## Formulários

### Padrão dominante (web admin e frontend)

```typescript
const [form, setForm] = useState({ ... });
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

<form onSubmit={async (e) => { e.preventDefault(); ... api.*() ... }}>
  <Input value={...} onChange={...} />
  <Button type="submit" disabled={submitting}>Salvar</Button>
</form>
```

### CRUD em modal (admin)

- Estados: `modalOpen`, `editing*`, `submitting`, `error`
- `Dialog` com form interno
- Após mutação: reload da lista via nova chamada GET

### Páginas dedicadas (admin)

- Criar/editar item: `/dashboard/conteudo/itens/novo`, `/dashboard/conteudo/itens/[id]`
- `Card` full-page, não modal

### Mobile

- Formulários nativos React Native com NativeWind
- Mesmos padrões de estado controlado

### react-hook-form + zod

- Instalados em frontend e admin
- `components/ui/form.tsx` existe (shadcn)
- **Nenhuma página em `app/` importa `useForm`** (admin)
- Frontend: `zod` no package.json sem imports no código fonte

---

## Tabelas

### admin-parlare

| Padrão | Uso |
|--------|-----|
| Listagem CRUD | `Table` + botões Editar/Excluir por linha |
| Usuários | Paginação manual (`page`, `limit=20`), busca, `Select` inline para status |
| Parties | Master-detail (lista + detalhe de membros) |
| Reportes | `Dialog` com log de detalhes |

### frontend-parlare

- Tabelas menos frequentes; listas em cards e componentes custom
- Ranking de competição em componentes dedicados

### mobile-parlare

- `FlatList` / `ScrollView` com cards em vez de tabelas HTML

---

## Modais e diálogos

| Tipo | Componente | Uso |
|------|------------|-----|
| CRUD | `Dialog` | Criar/editar entidades (admin) |
| Confirmação destrutiva | `AlertDialog` | Exclusões, reset DB, reset S3 |
| Detalhe/histórico | `Dialog` largo (`max-w-4xl`, scroll) | Histórico de usuário |
| Visualização | `Dialog` + `DialogTrigger` | Log de reportes |
| Mobile | `Modal` React Native | Equivalente funcional |

### Feedback de loading e erro

| Estado | Componente |
|--------|------------|
| Loading | `Skeleton` ou texto "Carregando..." |
| Erro | `Alert variant="destructive"` com `err.message` |
| Sucesso | Reload de lista ou navegação |

---

## Eventos customizados (frontend)

Comunicação entre componentes e shell via DOM events:

| Evento | Uso |
|--------|-----|
| `parlare-study-phase-change` | Ocultar sidebar durante estudo |
| `parlare-notifications-unread-count` | Atualizar badge de notificações |

---

## Acessibilidade e testes UI

| Item | Estado |
|------|--------|
| Componentes Radix | Padrões shadcn de acessibilidade |
| `lang="pt-BR"` | `<html>` em layouts |
| `data-testid` | Apenas em `admin-parlare/app/dashboard/conteudo/categorias/page.tsx` (prefixo `categorias-*`) |
| `.playwright-mcp/` | Logs de sessões MCP browser (admin) — não é suite formal |
