# Checklist UX — MVP Visual

## Fluxo aluno (R1)

- [ ] Landing transmite identidade da escola em 5 segundos
- [ ] Login demo com personas claras
- [ ] Dashboard destaca "Continuar de onde parou"
- [ ] Player estilo Udemy/Hotmart (sidebar + conteúdo)
- [ ] Exercícios com feedback didático
- [ ] Progresso atualiza ao concluir aula
- [ ] Mobile: sidebar via Sheet

## Fluxo professor (R2)

- [ ] Dashboard mostra correções pendentes
- [ ] Editor de aula permite adicionar blocos
- [ ] Preview abre frontend em nova aba
- [ ] Correção de redação reflete no aluno

## Go/no-go (R3)

- [ ] Builds passam (`npm run build` em ambos apps)
- [ ] Banner demo visível
- [ ] Loop aluno → professor → aluno funciona
- [ ] Copy em pt-BR

## Como testar

```bash
# Terminal 1
cd frontend-curso-italiano && npm run dev

# Terminal 2
cd crm-curso-italiano && npm run dev
```

- Frontend: http://localhost:3000/studio-italiano
- CRM: http://localhost:3001/login

Ver roteiro completo em `shared/lms-mocks/DEMO_SCRIPT.md`.
