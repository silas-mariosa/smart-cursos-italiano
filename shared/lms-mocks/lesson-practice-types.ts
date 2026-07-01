import type { Flashcard, SimulatorScenario } from "./practice-types";

export type PracticeModuleId = "quizzes" | "flashcards" | "simulator";

export interface PracticeModuleConfig {
  enabled: boolean;
  intro: string;
  order: number;
}

export interface LessonPracticeSettings {
  lessonId: string;
  modules: Record<PracticeModuleId, PracticeModuleConfig>;
  flashcards: Flashcard[];
  scenarios: SimulatorScenario[];
}

export const DEFAULT_MODULE_INTROS: Record<PracticeModuleId, string> = {
  quizzes: "Fixe o conteúdo com exercícios interativos. Feedback imediato para reforçar o aprendizado.",
  flashcards: "Toque no cartão para revelar a tradução. Marque os que você já domina.",
  simulator: "Pratique diálogos reais em situações do dia a dia. Escolha um cenário e responda em italiano.",
};

export function createDefaultPracticeSettings(lessonId: string): LessonPracticeSettings {
  return {
    lessonId,
    modules: {
      quizzes: { enabled: true, intro: DEFAULT_MODULE_INTROS.quizzes, order: 0 },
      flashcards: { enabled: true, intro: DEFAULT_MODULE_INTROS.flashcards, order: 1 },
      simulator: { enabled: true, intro: DEFAULT_MODULE_INTROS.simulator, order: 2 },
    },
    flashcards: [],
    scenarios: [],
  };
}
