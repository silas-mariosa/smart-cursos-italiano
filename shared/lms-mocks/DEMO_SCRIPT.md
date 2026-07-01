# Roteiro de demonstração — Studio Italiano

## Pré-requisitos

- Frontend: `cd frontend-curso-italiano && npm run dev` (porta 3000)
- CRM: `cd crm-curso-italiano && npm run dev` (porta 3001)
- `NEXT_PUBLIC_DEMO_MODE=true` nos `.env.local` de ambos os apps

## Roteiro (15 min)

### Parte 1 — Experiência do aluno (~8 min)

1. Abrir `http://localhost:3000/studio-italiano`
2. Landing → login como **Ana Silva**
3. Dashboard: card **Convocado** para aula ao vivo (se visível)
4. **Continuar de onde parou** → player de aula (só vídeo/texto/PDF)
5. Clicar **Ir para prática** → aba Quizzes, Flashcards, Simulador
6. Completar quiz com feedback → enviar redação
7. Header → **Central de prática** (`/praticar`)

### Parte 1b — Aula ao vivo (~5 min)

1. Dashboard → **Entrar na aula ao vivo**
2. Lobby: preview câmera/mic, convocação do professor, countdown
3. **Entrar na aula ao vivo** → sala estilo Google Meet
4. Testar mic, câmera, chat, levantar mão, sair

### Parte 2 — Experiência do professor (~6 min)

1. Abrir `http://localhost:3001/login`
2. Entrar como **Prof. Marco Rossi**
3. Dashboard: correções pendentes (badge)
4. Abrir fila de correções → corrigir redação da Ana
5. Voltar ao frontend (Ana) → ver nota em "Minhas notas"
6. Abrir editor de curso A1 → adicionar bloco de texto
7. Pré-visualizar como aluno (nova aba)

### Parte 3 — Admin (~2 min)

1. Login como **Admin Escola**
2. Configuração → alterar cor primária
3. Abrir landing em nova aba → ver cores aplicadas

## Personas disponíveis

| Persona | App | Progresso |
|---------|-----|-----------|
| Ana Silva | Frontend | 45% A1 |
| Lucas Mendes | Frontend | 90% A1 |
| Maria Costa | Frontend | 12% A1 |
| Prof. Marco Rossi | CRM | — |
| Admin Escola | CRM | — |
