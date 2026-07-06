# Roteiro de demo comercial — planos manuais + webhooks

Use CRM em `localhost:3001` (ou porta do CRM) e frontend aluno em `localhost:3000/studio-italiano`.

## Cenário 1 — Gestão manual

| Passo | Onde | Ação | Resultado |
|-------|------|------|-----------|
| 1 | CRM → Login | Entrar como **Prof. Giulia** (Escola Roma Básica) | Plano Basic |
| 2 | CRM → Meu plano | **Escolher plano** Pro (mock) | Módulos extras desbloqueados |
| 3 | CRM → Planos de alunos | Criar template **Semestral A1** com cursos A1+A2 | Catálogo |
| 4 | CRM → Alunos | Cadastrar aluno + template | Aluno pending, matriculado |
| 5 | CRM → Aluno → Cursos | Adicionar curso extra manualmente | Matrícula adicional |
| 6 | CRM → Aluno → Financeiro | Registrar pagamento → **Confirmar** | Status active |
| 7 | Frontend → Ana | Minha conta | Plano e cursos liberados |
| 8 | CRM → Aluno → Financeiro | **Marcar inadimplente** | — |
| 9 | Frontend → Ana | Tentar abrir curso | Tela bloqueada + CTA suporte |
| 10 | Frontend → Suporte | Nova conversa "Problema com pagamento" | Status open |
| 11 | CRM → Suporte | Responder Ana | Status waiting_student |
| 12 | Frontend → Ana | Ver resposta no chat | Thread completa |

## Cenário 2 — Kiwify/Hotmart (mock)

| Passo | Onde | Ação | Resultado |
|-------|------|------|-----------|
| 1 | CRM → Configuração → Integrações | Ativar Kiwify, mapear produto → curso | URL webhook |
| 2 | CRM → Integrações | **Simular compra aprovada** | Preview e-mail + aluno criado |
| 3 | CRM → Aluno | Ver senha provisória e origem Kiwify | Dados mock |
| 4 | Frontend → Login | Maria Costa (badge Kiwify) | Senha demo: `Maria2026` |

## Personas úteis

- **Marco Rossi** — Studio Italiano, Pro (suporte + alunos Ana/Lucas/Maria)
- **Giulia Bianchi** — Roma Básica, Basic (upgrade demo)
- **Ana Silva** — aluna active, conversa suporte demo aberta
- **Maria Costa** — aluna via Kiwify, status pending até confirmação no CRM
