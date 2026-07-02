import type { Spacing } from "@lms-mocks/page-builder-types";

export type StyleEditorMode = "basic" | "professional";

const STYLE_MODE_STORAGE_KEY = "page-builder-style-mode";

export function loadStyleEditorMode(): StyleEditorMode {
  if (typeof window === "undefined") return "basic";
  const stored = localStorage.getItem(STYLE_MODE_STORAGE_KEY);
  return stored === "professional" ? "professional" : "basic";
}

export function saveStyleEditorMode(mode: StyleEditorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STYLE_MODE_STORAGE_KEY, mode);
}

export function getUniformSpacing(spacing?: Spacing): number {
  if (!spacing) return 0;
  const values = [spacing.top, spacing.right, spacing.bottom, spacing.left].filter((v) => v != null) as number[];
  if (values.length === 0) return 0;
  return Math.max(...values);
}

export function uniformSpacing(value: number): Spacing | undefined {
  if (value <= 0) return undefined;
  return { top: value, right: value, bottom: value, left: value };
}

export function parseShadowIntensity(boxShadow?: string): number {
  if (!boxShadow?.trim()) return 0;
  const match = boxShadow.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/i);
  const blurMatch = boxShadow.match(/(\d+)px/g);
  if (blurMatch && blurMatch.length >= 2) {
    const blur = Number(blurMatch[blurMatch.length - 1]?.replace("px", "") ?? 0);
    return Math.min(100, Math.round((blur / 24) * 100));
  }
  return match ? 40 : 0;
}

export function buildShadowFromIntensity(intensity: number): string | undefined {
  if (intensity <= 0) return undefined;
  const y = Math.round(intensity * 0.08);
  const blur = Math.round(intensity * 0.24);
  const opacity = Math.min(0.35, (intensity / 100) * 0.25).toFixed(2);
  return `0 ${y}px ${blur}px rgba(0,0,0,${opacity})`;
}

export function normalizeFontWeight(weight?: number | string): number {
  const parsed = Number(weight);
  if (!Number.isFinite(parsed) || parsed <= 0) return 400;
  return Math.min(900, Math.max(300, Math.round(parsed / 100) * 100));
}
