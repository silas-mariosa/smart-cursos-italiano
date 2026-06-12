# TESTING_PATTERNS

Estratégia de testes observada no ecossistema Parlare / Manylingua.

---

## Resumo por repositório

| Repositório | Framework | Arquivos de teste | Script `test` | CI |
|-------------|-----------|-------------------|-----------------|-----|
| backend-parlare | `bun:test` | 4 arquivos `.test.ts` | Placeholder (falha) | Não identificado |
| frontend-parlare | — | Nenhum | Ausente | Não identificado |
| admin-parlare | — | Nenhum | Ausente | Não identificado |
| mobile-parlare | — | Nenhum | Ausente | Não identificado |
| games-server | — | Nenhum | Ausente | Não identificado |

**Conclusão:** o ecossistema possui **cobertura de testes automatizados mínima**, concentrada no backend.

---

## backend-parlare

### Framework

- **`bun:test`** — `describe`, `test`/`it`, `expect`
- Sem Jest, Vitest ou configuração de CI visível

### Script npm

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

O script `npm test` é placeholder e **falha**. Testes devem ser executados diretamente com `bun test`.

### Arquivos de teste

| Arquivo | Escopo |
|---------|--------|
| `src/resource/study/session-diagnostics.test.ts` | Diagnóstico de sessão vazia pós-IA |
| `src/resource/study/ad-reward.test.ts` | Validação de proof de anúncio web |
| `src/ai/persist-generated-items.helpers.test.ts` | Helpers de persistência de itens gerados |
| `src/resource/competition/competition-user-state.test.ts` | Promoção/rebaixamento em competição |

### Tipo de testes

- **Unitários** — funções puras e helpers
- **Sem** testes de integração HTTP
- **Sem** testes de banco de dados
- **Sem** mocks de serviços externos documentados

### Verificação estática

- TypeScript `strict: true`
- Sem script `typecheck` dedicado no package.json

---

## frontend-parlare

| Item | Estado |
|------|--------|
| Arquivos `*.test.*` / `*.spec.*` | Nenhum |
| Script de teste | Ausente |
| Framework | Nenhum configurado |
| `@playwright/test` | Dependência transitiva no lockfile, não configurada |
| Qualidade | Apenas `npm run lint` (ESLint + next core-web-vitals) |
| CI | Pasta `.github/workflows` ausente |

---

## admin-parlare

| Item | Estado |
|------|--------|
| Arquivos de teste | Nenhum |
| Script de teste | Ausente |
| `data-testid` | Apenas em `app/dashboard/conteudo/categorias/page.tsx` (prefixo `categorias-*`) |
| `.playwright-mcp/` | Logs YAML de sessões MCP browser — **não é suite formal** |
| RDA.md | Menciona Playwright para categorias |
| Qualidade | Apenas `npm run lint` |

---

## mobile-parlare

| Item | Estado |
|------|--------|
| Arquivos de teste | Nenhum |
| Framework | Nenhum (sem Jest, Vitest, Detox, Maestro) |
| Scripts | Apenas `lint` e `format` |
| Referências a "teste" | Funcionalidades de produto (`teste-de-ingles`, AdMob `TestIds`) |
| `store/store.ts` | Boilerplate Zustand de exemplo, não usado |

---

## games-server

| Item | Estado |
|------|--------|
| Arquivos de teste | Nenhum |
| Script de verificação | `typecheck` (`tsc --noEmit`) |
| Testes manuais | Documentados no README (múltiplas abas/janelas) |

---

## Preparação para E2E (observada, não implementada)

| Item | Local |
|------|-------|
| `data-testid` com prefixo `categorias-*` | admin-parlare categorias page |
| Menção a Playwright | admin RDA.md |
| Logs MCP browser | admin `.playwright-mcp/` |

---

## Estratégia implícita observada

Com base no código existente, a estratégia atual parece ser:

1. **Testes unitários pontuais** no backend para lógica crítica (competição, persistência IA, ad-reward)
2. **Lint** como única verificação automatizada nos clientes
3. **Typecheck** apenas no games-server
4. **Testes manuais** documentados para games-server e mencionados para admin (Playwright)
5. **Sem pipeline CI** de testes identificado nos repositórios
