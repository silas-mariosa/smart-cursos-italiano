import type { ExerciseDifficulty, ExerciseType } from "@lms-mocks/types";

export const TYPE_LABELS: Record<ExerciseType, string> = {
  multiple_choice: "Múltipla escolha",
  true_false: "Verdadeiro ou falso",
  fill_blank: "Preencher lacunas",
  written_response: "Resposta escrita",
};

export const TYPE_SHORT: Record<ExerciseType, string> = {
  multiple_choice: "Múltipla",
  true_false: "V/F",
  fill_blank: "Lacuna",
  written_response: "Redação",
};

export const TYPE_COLORS: Record<ExerciseType, string> = {
  multiple_choice: "bg-blue-100 text-blue-800 border-blue-200",
  true_false: "bg-purple-100 text-purple-800 border-purple-200",
  fill_blank: "bg-amber-100 text-amber-800 border-amber-200",
  written_response: "bg-rose-100 text-rose-800 border-rose-200",
};

export const TYPE_ICONS: Record<ExerciseType, string> = {
  multiple_choice: "◉",
  true_false: "✓✗",
  fill_blank: "___",
  written_response: "✎",
};

export const DIFFICULTY_LABELS: Record<ExerciseDifficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

export const DIFFICULTY_COLORS: Record<ExerciseDifficulty, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-red-100 text-red-800",
};

export const DEFAULT_XP: Record<ExerciseDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

export const FILTER_TYPES = ["all", "multiple_choice", "true_false", "fill_blank", "written_response"] as const;
export type ExerciseFilterType = (typeof FILTER_TYPES)[number];
