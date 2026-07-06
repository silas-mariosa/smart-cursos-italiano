export type HeadingLevel = 2 | 3 | 4;

export const HEADING_LEVEL_DEFAULTS: Record<
  HeadingLevel,
  { fontSize: number; fontWeight: number; lineHeight: number; tailwindClass: string }
> = {
  2: { fontSize: 28, fontWeight: 700, lineHeight: 1.3, tailwindClass: "text-[1.75rem] font-bold leading-tight" },
  3: { fontSize: 22, fontWeight: 600, lineHeight: 1.35, tailwindClass: "text-[1.375rem] font-semibold leading-snug" },
  4: { fontSize: 18, fontWeight: 600, lineHeight: 1.4, tailwindClass: "text-lg font-semibold leading-snug" },
};

export function normalizeHeadingLevel(level: unknown): HeadingLevel {
  const n = Number(level);
  if (n === 3) return 3;
  if (n === 4) return 4;
  return 2;
}

export function headingTag(level: HeadingLevel): "h2" | "h3" | "h4" {
  if (level === 3) return "h3";
  if (level === 4) return "h4";
  return "h2";
}

export function headingTypographyStyle(
  level: HeadingLevel,
  typography?: { fontSize?: number; fontWeight?: number | string; lineHeight?: number },
): { fontSize: number; fontWeight: number | string; lineHeight: number; margin: 0 } {
  const defaults = HEADING_LEVEL_DEFAULTS[level];
  return {
    fontSize: typography?.fontSize ?? defaults.fontSize,
    fontWeight: typography?.fontWeight ?? defaults.fontWeight,
    lineHeight: typography?.lineHeight ?? defaults.lineHeight,
    margin: 0,
  };
}

export function headingStylePatchForLevel(level: HeadingLevel) {
  const defaults = HEADING_LEVEL_DEFAULTS[level];
  return {
    typography: {
      fontSize: defaults.fontSize,
      fontWeight: defaults.fontWeight,
      lineHeight: defaults.lineHeight,
    },
  };
}
