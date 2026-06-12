# DATABASE

Schema e convenções do banco de dados PostgreSQL, definidos exclusivamente em `backend-parlare/src/drizzle/schema.ts`.

ORM: **Drizzle ORM**. Migrations em `backend-parlare/drizzle/migrations/`.

---

## Convenções de nomenclatura

| Aspecto | Convenção |
|---------|-----------|
| Tabelas | `snake_case` (ex.: `user_learning_progress`, `learning_items`) |
| Colunas | `snake_case` (ex.: `preferred_language_id`, `created_at`) |
| Exceções em TS | Algumas colunas em camelCase no código TS (ex.: `emailVerifiedAt`, `avatarUrl`) |
| Primary keys | UUID texto — `text("id").$defaultFn(() => crypto.randomUUID())` |
| Enums PostgreSQL | lowercase (ex.: `role`, `difficulty`, `study_mode`) |
| Tipos exportados | `InferSelectModel` / `InferInsertModel` (ex.: `AuthType`, `LearningItemType`) |
| Relations | Declaradas com `relations()` no final de `schema.ts` |

**Regra:** schema apenas em `src/drizzle/schema.ts`. Não criar outros arquivos de schema.

---

## Principais entidades

### Auth e usuário

| Tabela | Descrição |
|--------|-----------|
| `auth` | Usuários: name, email, password (nullable OAuth), role, user_status, onboarding_profile (jsonb), preferred_language_id, google_id, avatar_url, referral_code, expo_push_token |
| `email_verification_code` | Códigos de 6 dígitos para verificação e recuperação de senha |

**Enums:**

- `role`: `user` | `admin`
- `user_status`: `free` | `premium` | `testador`

### Auditoria

| Tabela | Descrição |
|--------|-----------|
| `openai_request_logs` | Auditoria de chamadas IA (tokens, duração, validação Zod) |
| `backend_error_logs` | Falhas operacionais (severity, domain, code, stack) |

### Conteúdo (modelo Lexeme)

| Tabela | Descrição |
|--------|-----------|
| `languages` | Idiomas disponíveis |
| `category_concepts` | Conceito de categoria (agnóstico de idioma) |
| `categories` | Categoria localizada por idioma |
| `lexemes` | Unidade lexical base |
| `lexeme_texts` | Texto do lexema por idioma |
| `learning_items` | Item de aprendizado (referencia lexeme_id, lexeme_text_id) |
| `theme_concepts` | Conceito de tema |
| `themes` | Tema localizado |
| `tag_concepts` | Conceito de tag |
| `tag_localizations` | Tag localizada |
| `learning_item_tags` | N:N item ↔ tag |
| `learning_item_themes` | N:N item ↔ tema |
| `content_correction_reports` | Reportes de correção de tradução/áudio |

### Estudo e progresso

| Tabela | Descrição |
|--------|-----------|
| `user_learning_progress` | Progresso por item/usuário |
| `study_sessions` | Sessões de estudo |
| `study_session_items` | Itens de uma sessão |
| `user_review_queue` | Fila de revisão espaçada |
| `study_initial_bulk_seed` | Controle de seed inicial |
| `placement_test_attempts` | Tentativas de teste de nivelamento |
| `placement_test_answers` | Respostas do placement test |

**Enums de estudo:**

- `study_mode`: `flashcard`, `quiz`, `listening_quiz`, `sentence_building`, `construction`, `match_pairs`
- `study_focus`: `grammar`, `vocabulary`, `mixed`, `situations`
- `difficulty`: `beginner`, `intermediate`, `advanced`

### Gamificação

| Tabela | Descrição |
|--------|-----------|
| `user_stats` | Stats globais (XP, nível, streak) |
| `user_language_stats` | XP e nível por idioma (1–60) |
| `badges` | Definição de badges |
| `user_badges` | Badges conquistados |
| `missions` | Definição de missões |
| `user_missions` | Missões do usuário |
| `user_daily_missions` | Missões diárias |
| `user_energy` | Energia para estudo |
| `ad_reward_intents` | Intenções de recompensa por anúncio |
| `ad_reward_events` | Eventos de recompensa consumidos |

### Competição semanal

| Tabela | Descrição |
|--------|-----------|
| `competition_weeks` | Semanas de competição |
| `competition_parties` | Parties (grupos) |
| `competition_party_members` | Membros de party |
| `competition_user_language_state` | Estado do usuário por idioma (patente) |
| `user_competition_week_presence` | Presença na semana |
| `competition_week_xp_snapshots` | Snapshots de XP para ranking |

### Social

| Tabela | Descrição |
|--------|-----------|
| `user_follows` | Relação de seguir |
| `user_friend_requests` | Pedidos de amizade |
| `user_friendships` | Amizades aceitas |
| `user_blocks` | Bloqueios |

### Notificações

| Tabela | Descrição |
|--------|-----------|
| `user_notifications` | Notificações in-app |
| `notification_preferences` | Preferências por tipo |
| `notification_campaigns` | Campanhas admin |
| `notification_campaign_deliveries` | Entregas de campanha |
| `email_unsubscribe_tokens` | Tokens de descadastro |

### Planos e pagamento

| Tabela | Descrição |
|--------|-----------|
| `plans` | Definição de planos |
| `user_plans` | Plano ativo do usuário |
| `user_payment` | Histórico de pagamento |

### Jogos

| Tabela | Descrição |
|--------|-----------|
| `game_matches` | Partidas (solo e PvP) |
| `game_match_participants` | Participantes e scores |

**Enum `game_match_mode`:** `word_search`, `fast_translation`, `sentence_builder`, `reaction_duel`

### Outros

| Tabela | Descrição |
|--------|-----------|
| `referral_reward_events` | Recompensas de indicação |
| `app_version` | Singleton com versão mínima obrigatória do app |

---

## Relacionamentos principais

### Modelo de conteúdo (Lexeme)

```
languages
    ↓
category_concepts → categories (por language_id)
lexemes → lexeme_texts (por language_id)
    ↓
learning_items (lexeme_id + lexeme_text_id)
    ↓
learning_item_themes ← themes ← theme_concepts
learning_item_tags ← tag_localizations ← tag_concepts
```

### Usuário e domínios derivados

```
auth
 ├── user_learning_progress
 ├── study_sessions → study_session_items
 ├── user_review_queue
 ├── user_stats
 ├── user_language_stats
 ├── user_badges ← badges
 ├── user_missions ← missions
 ├── user_energy
 ├── user_plans ← plans
 ├── competition_party_members → competition_parties
 ├── user_follows / user_friendships / user_blocks
 ├── user_notifications
 └── game_match_participants → game_matches
```

### Competição

```
competition_weeks
    ↓
competition_parties → competition_party_members → auth
    ↓
competition_user_language_state (por usuário/idioma)
competition_week_xp_snapshots (ranking)
```

### Self-reference

- `auth.referred_by_user_id` → `auth.id` (indicação)

---

## Operações de schema

| Comando | Uso |
|---------|-----|
| `bun run db:generate` | Gera migration após alterar schema |
| `bun run migrate` | Executa migrations |
| `bun run db:push` | Push direto (dev, com cuidado) |
| `bun run db:studio` | Drizzle Studio |
| `bun run seed` | Cria admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) |

---

## Redis (games-server)

Estado efêmero — **não** persistido no PostgreSQL:

| Chave | Tipo | Uso |
|-------|------|-----|
| `queue:{mode}:{languageId}:{nativeKey}` | Sorted set | Fila de matchmaking |
| `match:{matchId}` | JSON string | Estado da partida |
| `userMatch:{userId}` | string | matchId ativo |

Prefixo configurável: `REDIS_KEY_PREFIX` (default `parlare:games:`). TTL de partidas: 7200s (2h).
