import type { Flashcard } from "./practice-types";

export const flashcards: Flashcard[] = [
  { id: "fc-1", lessonId: "lesson-a1-1", front: "Buongiorno", back: "Bom dia", hint: "Saudação matinal" },
  { id: "fc-2", lessonId: "lesson-a1-1", front: "Ciao", back: "Olá / Tchau", hint: "Informal" },
  { id: "fc-3", lessonId: "lesson-a1-1", front: "Arrivederci", back: "Até logo", hint: "Formal" },
  { id: "fc-4", lessonId: "lesson-a1-2", front: "Come stai?", back: "Como você está?", hint: "Informal" },
  { id: "fc-5", lessonId: "lesson-a1-2", front: "Come sta?", back: "Como o senhor/a senhora está?", hint: "Formal" },
  { id: "fc-6", lessonId: "lesson-a1-2", front: "Bene, grazie", back: "Bem, obrigado", hint: "Resposta comum" },
  { id: "fc-7", lessonId: "lesson-a1-3", front: "Vorrei un caffè", back: "Gostaria de um café", hint: "No bar" },
  { id: "fc-8", lessonId: "lesson-a1-3", front: "Il conto, per favore", back: "A conta, por favor", hint: "Restaurante" },
  { id: "fc-9", lessonId: "lesson-a1-3", front: "Un tavolo per due", back: "Uma mesa para dois", hint: "Restaurante" },
  { id: "fc-10", lessonId: "lesson-a1-5", front: "venti", back: "vinte (20)", hint: "Número" },
  { id: "fc-11", lessonId: "lesson-a1-5", front: "dieci", back: "dez (10)", hint: "Número" },
  { id: "fc-12", lessonId: "lesson-a1-5", front: "cento", back: "cem (100)", hint: "Número" },
];

import { getStoredLessonPracticeMap } from "./storage";

export function getFlashcardsByLesson(lessonId: string): Flashcard[] {
  const stored = getStoredLessonPracticeMap()[lessonId];
  if (stored) {
    if (!stored.modules?.flashcards?.enabled) return [];
    if (stored.flashcards.length > 0) return stored.flashcards;
  }
  return flashcards.filter((f) => f.lessonId === lessonId);
}

export function getFlashcardsByCourse(lessonIds: string[]): Flashcard[] {
  return flashcards.filter((f) => lessonIds.includes(f.lessonId));
}
