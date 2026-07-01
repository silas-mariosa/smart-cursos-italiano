import type { Lesson } from "./types";

export function getLessonExerciseIds(lesson: Lesson): string[] {
  return lesson.blocks
    .filter((b) => b.type === "exercise")
    .map((b) => (b.content as { exerciseId: string }).exerciseId);
}

export function getContentBlocks(lesson: Lesson) {
  return lesson.blocks.filter((b) => b.type !== "exercise").sort((a, b) => a.order - b.order);
}

export function lessonHasExercises(lesson: Lesson): boolean {
  return lesson.blocks.some((b) => b.type === "exercise");
}

export function lessonHasPractice(lesson: Lesson): boolean {
  return lessonHasExercises(lesson);
}
