export type Locale = "pt-BR" | "en-US";

export const messages: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    "app.title": "Template App",
    "nav.dashboard": "Dashboard",
    "nav.login": "Entrar",
    "auth.login.title": "Entrar na sua conta",
    "auth.login.submit": "Entrar",
    "auth.email": "E-mail",
    "auth.password": "Senha",
    "dashboard.welcome": "Bem-vindo, {name}",
  },
  "en-US": {
    "app.title": "Template App",
    "nav.dashboard": "Dashboard",
    "nav.login": "Sign in",
    "auth.login.title": "Sign in to your account",
    "auth.login.submit": "Sign in",
    "auth.email": "Email",
    "auth.password": "Password",
    "dashboard.welcome": "Welcome, {name}",
  },
};
