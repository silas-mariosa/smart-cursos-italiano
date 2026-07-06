# Inventário de telas — MVP Visual LMS

## Frontend (Aluno)

| ID | Rota | Descrição | Status |
|----|------|-----------|--------|
| F01 | `/[tenant]` | Landing white label | Implementado |
| F02 | `/[tenant]/auth/login` | Login demo | Implementado |
| F03 | `/[tenant]/dashboard` | Dashboard + convocação ao vivo | Implementado |
| F04 | `/[tenant]/cursos/[courseId]` | Overview do curso | Implementado |
| F05 | `/[tenant]/cursos/.../aulas/[lessonId]` | Aula — só conteúdo (vídeo, texto, PDF) | Implementado |
| F05b | `/[tenant]/cursos/.../aulas/[lessonId]/praticar` | Prática: quizzes, flashcards, simulador | Implementado |
| F05c | `/[tenant]/praticar` | Central de prática | Implementado |
| F07 | `/[tenant]/perfil` | Perfil e skills | Implementado |
| F08 | `/[tenant]/ao-vivo` | Lista de aulas ao vivo | Implementado |
| F09 | `/[tenant]/ao-vivo/[sessionId]` | Lobby / convocação (pré-entrada) | Implementado |
| F10 | `/[tenant]/ao-vivo/[sessionId]/sala` | Sala ao vivo estilo Google Meet | Implementado |
| F11 | `/[tenant]/simulados` | Simulados (provas formais) | Implementado |
| F12 | `/[tenant]/ao-vivo/gravacoes` | Lives gravadas (replay + biblioteca) | Implementado |

## CRM (Professor/Admin)

| ID | Rota | Status |
|----|------|--------|
| C01 | `/login` | Implementado |
| C02 | `/dashboard` | Implementado |
| C03 | `/dashboard/cursos` | Implementado |
| C04 | `/dashboard/cursos/[id]` | Implementado |
| C05 | `/dashboard/cursos/[id]/aulas/[lessonId]` | Implementado |
| C06 | `/dashboard/exercicios` | Implementado |
| C07 | `/dashboard/correcoes` | Implementado |
| C08 | `/dashboard/correcoes/[id]` | Implementado |
| C09 | `/dashboard/alunos` | Implementado |
| C10 | `/dashboard/alunos/[id]` | Implementado |
| C11 | `/dashboard/configuracao` | Implementado |
| C12 | `/dashboard/ao-vivo` | Implementado |
| C13 | `/dashboard/ao-vivo/[sessionId]` | Implementado |
| C14 | `/dashboard/praticar` | Implementado |
| C15 | `/dashboard/cursos/[id]/aulas/[lessonId]/praticar` | Implementado |
| C16 | `/dashboard/alunos/planos` | Planos de aluno com permissões | Implementado |
| C17 | `/dashboard/ao-vivo/calendario` | Calendário de aulas ao vivo | Implementado |
| C18 | `/dashboard/ao-vivo/gravacoes` | Biblioteca de lives gravadas | Implementado |
| C19 | `/dashboard/simulados`, `/novo`, `/[id]/editar` | Editor de simulados | Implementado |
| C20 | `/dashboard/simulados/resultados`, `/[id]/resultados` | Análise de tentativas | Implementado |
