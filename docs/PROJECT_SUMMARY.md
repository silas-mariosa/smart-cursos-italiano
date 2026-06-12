# PROJECT_SUMMARY

Documentação factual do ecossistema **Parlare / Manylingua**, baseada exclusivamente no código existente nos repositórios:

- `backend-parlare` — API REST
- `frontend-parlare` — aplicação web do usuário final
- `admin-parlare` — painel administrativo
- `mobile-parlare` — aplicativo iOS/Android (Expo)
- `games-server` — serviço WebSocket para minijogos PvP em tempo real

---

## Objetivo do sistema

Plataforma de **estudo gamificado de idiomas** (marca comercial **Manylingua**). O sistema oferece:

- Autenticação e perfil de usuário com onboarding
- Catálogo de conteúdo multilíngue (idiomas, categorias, temas, itens de aprendizado)
- Sessões de estudo com múltiplos modos (flashcard, quiz, listening, construção de frases, match pairs)
- Geração lazy de itens via IA (OpenAI-compatible)
- Progresso, revisão espaçada e fila de erros
- Gamificação (XP global e por idioma, níveis, badges, missões, energia, streak)
- Competição semanal por idioma (party, ranking, patentes)
- Social (seguir, amizades, bloqueios, feed)
- Notificações (in-app, push Expo, campanhas de e-mail)
- Planos e assinaturas (RevenueCat)
- Teste de nivelamento (placement test)
- Minijogos solo e PvP em tempo real
- Painel administrativo para gestão de conteúdo, usuários e operações

Fontes: `backend-parlare/RDA.md`, `backend-parlare/README.md`, `frontend-parlare/RDA.md`, `admin-parlare/RDA.md`, `mobile-parlare/RDA.md`, `games-server/README.md`.

---

## Principais funcionalidades

### Usuário final (frontend-parlare + mobile-parlare)

| Área | Funcionalidades |
|------|-----------------|
| **Auth** | Cadastro, login, verificação de e-mail, recuperação de senha, Google OAuth, exclusão de conta |
| **Onboarding** | Questionário pré-cadastro com perfil de estudo |
| **Estudo** | Sessões com modos `flashcard`, `quiz`, `listening_quiz`, `sentence_building`, `match_pairs`; preferências de foco e modo; energia com recompensa por anúncio |
| **Revisão** | Fila de revisão espaçada, marcação de itens difíceis |
| **Progresso** | Histórico, itens aprendidos, erros por idioma |
| **Gamificação** | Stats, badges, missões diárias, XP, níveis (1–60 por idioma) |
| **Competição** | Party semanal, ranking, patente, emoji de status, revanche |
| **Social** | Seguir, amizades, bloqueios, busca de usuários, perfil público, feed |
| **Notificações** | Lista in-app, preferências, reações |
| **Jogos** | 4 modos: `word_search`, `fast_translation`, `sentence_builder`, `reaction_duel` (solo e PvP online) |
| **Placement test** | Teste de nivelamento com resultado por tentativa |
| **Conta** | Preferências, idiomas, privacidade, assinatura |
| **Assinatura** | Planos free/premium via RevenueCat |

### Administrador (admin-parlare)

| Área | Funcionalidades |
|------|-----------------|
| **Analytics** | Estatísticas da plataforma |
| **Conteúdo** | CRUD de idiomas, categorias, temas, itens de aprendizado |
| **Áudio** | Sync TTS + upload S3 para itens sem áudio |
| **Gamificação** | CRUD badges e missões; gestão de parties de competição |
| **Usuários** | Listagem, status (`free`/`premium`/`testador`), verificação de e-mail, histórico |
| **Planos** | CRUD de planos |
| **Comunicação** | Campanhas de e-mail, push mobile (Expo) |
| **Moderação** | Reportes de correção de tradução |
| **Operações** | Reset/seed de banco, preenchimento de catálogo com IA, versão mínima do app |
| **App version** | Configuração de versão mínima obrigatória |

### Backend (backend-parlare)

- API REST com ~20 módulos de recursos
- Cron interno para convites de prática e fechamento de semanas de competição
- Webhook RevenueCat para sincronização de assinaturas
- Endpoints internos para games-server (deck, complete, rematch, purge LGPD)
- Geração de conteúdo via IA com auditoria em `openai_request_logs`

### Games-server

- Matchmaking PvP via Redis
- Lógica autoritativa dos 4 modos de jogo
- WebSocket com JWT
- Integração HTTP com backend para deck e persistência de resultados

---

## Tipo de usuários

| Tipo | `role` / status | Acesso |
|------|-----------------|--------|
| **Usuário final** | `role: user` | frontend-parlare, mobile-parlare |
| **Administrador** | `role: admin` | admin-parlare (validação dupla: JWT + role no banco) |
| **Usuário free** | `user_status: free` | Funcionalidades base; regras de negócio limitam recursos premium |
| **Usuário premium** | `user_status: premium` | Acesso a recursos de assinatura |
| **Testador** | `user_status: testador` | Status especial para testes (usado em regras de negócio) |

Autenticação via JWT (Bearer token + cookies httpOnly para refresh). Contas OAuth (Google) têm `password` nulo e `google_id` preenchido.
