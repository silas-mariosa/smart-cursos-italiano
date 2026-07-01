import { flashcards as seedFlashcards } from "./flashcards";
import { simulatorScenarios as seedScenarios } from "./simulator";
import { createDefaultPracticeSettings } from "./lesson-practice-types";
import type { LessonPracticeSettings } from "./lesson-practice-types";
import { getStoredLessonPracticeMap, setStoredLessonPractice } from "./storage";

export function resolveLessonPractice(lessonId: string): LessonPracticeSettings {
  const stored = getStoredLessonPracticeMap()[lessonId];
  const seedFc = seedFlashcards.filter((f) => f.lessonId === lessonId);
  const seedSim = seedScenarios.filter((s) => s.lessonId === lessonId);
  const defaults = createDefaultPracticeSettings(lessonId);

  if (!stored) {
    return { ...defaults, flashcards: seedFc, scenarios: seedSim };
  }

  return {
    ...defaults,
    ...stored,
    lessonId,
    modules: {
      quizzes: { ...defaults.modules.quizzes, ...stored.modules?.quizzes },
      flashcards: { ...defaults.modules.flashcards, ...stored.modules?.flashcards },
      simulator: { ...defaults.modules.simulator, ...stored.modules?.simulator },
    },
    flashcards: stored.flashcards ?? seedFc,
    scenarios: stored.scenarios ?? seedSim,
  };
}

export function saveLessonPractice(settings: LessonPracticeSettings) {
  setStoredLessonPractice(settings);
}

export { createDefaultPracticeSettings } from "./lesson-practice-types";
export type { LessonPracticeSettings, PracticeModuleId } from "./lesson-practice-types";
