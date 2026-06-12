import type { Locale } from "./messages";

const STORAGE_KEY = "template_ui_locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en-US" ? "en-US" : "pt-BR";
}

export function setStoredLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, locale);
  }
}

export function interpolate(text: string, vars?: Record<string, string>) {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value),
    text,
  );
}
