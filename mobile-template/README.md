# Mobile Template

Template de **infraestrutura mobile** (sem regras de negócio), gerado com [Create Expo Stack](https://rn.new) (`rn-new`) e adaptado aos padrões dos projetos reais (`mobile-balaioCriativo`, `template-analysis`).

## Como foi criado

```bash
npx rn-new@latest mobile-template --expo-router --nativewind --no-git --bun
```

> No Windows, o passo final `expo install --fix` do CLI pode falhar. Rode manualmente na pasta do projeto:
>
> ```bash
> npx expo install --fix
> ```

## Stack

| Tecnologia | Versão / nota |
|------------|---------------|
| Expo SDK | 54 |
| React Native | 0.81 |
| expo-router | 6 (file-based routing) |
| NativeWind | v4 (Tailwind no RN) |
| TanStack React Query | cache e mutations |
| Auth | AsyncStorage + `jwt-decode` |
| Validação | Zod (disponível para formulários) |
| Testes | jest-expo |
| New Architecture | habilitada em `app.json` |

## Arquitetura

```
mobile-template/
├── app/
│   ├── _layout.tsx        # Providers (Query, Auth, SafeArea, NativeWind)
│   ├── index.tsx          # Redirect auth ↔ dashboard
│   ├── auth/login.tsx     # Tela de login genérica
│   └── dashboard/         # Área autenticada (guard no layout)
├── components/            # UI compartilhada (ex.: Screen)
├── config/api.ts          # EXPO_PUBLIC_API_URL
├── context/               # AuthProvider
├── hooks/                 # useQuery + fetch (sem services/)
├── lib/reactQueryClient.ts
├── global.css             # Tailwind (NativeWind v4)
├── tailwind.config.js
└── metro.config.js        # withNativeWind
```

### Decisões

- **rn-new + NativeWind v4**: scaffolding oficial com Tailwind, `global.css`, preset no Babel/Metro.
- **Sem pasta `services/`**: dados remotos em `hooks/` com React Query (padrão Balaio/Parlare).
- **Auth genérica**: JWT em AsyncStorage (`"token"`), payload tipado com `role: user | admin`.
- **Sem integrações de negócio**: sem push, pagamentos, OAuth ou entidades específicas.
- **Estilos**: `className` via NativeWind; componente `Screen` para layout consistente.

## Início rápido

```bash
cd mobile-template
bun install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL
bun run start
```

Requer o backend-template rodando (ex.: `http://localhost:4000`) para login e `/auth/me`.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | URL base da API (padrão: `http://localhost:4000`) |

## Testes

```bash
bun run test
```

## Build (EAS)

Adicione `eas.json` com profiles `development`, `preview` e `production` conforme a necessidade do projeto.

## Referências

- [Create Expo Stack — Installation](https://docs.rn.new/en/installation/)
- `template-analysis/COMMON_ARCHITECTURE.md` — estrutura mobile canônica
- `template-analysis/COMMON_STACK.md` — versões de pacotes
