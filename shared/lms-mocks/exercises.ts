import type { Course, Exercise, ExerciseConfig, ExerciseDifficulty, ExerciseGamification, ExerciseType, FillBlankConfig, MultipleChoiceConfig, TrueFalseConfig, WrittenResponseConfig } from "./types";

const DEFAULT_XP: Record<ExerciseDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

export function createDefaultGamification(difficulty: ExerciseDifficulty = "medium"): ExerciseGamification {
  return { difficulty, xpReward: DEFAULT_XP[difficulty], tags: [] };
}

export const exercises: Exercise[] = [
  {
    id: "MC-001",
    tenantId: "tenant-studio-italiano",
    title: "Tradução Buongiorno",
    type: "multiple_choice",
    usedInLessonIds: ["lesson-a1-1", "lesson-a1-3"],
    gamification: { difficulty: "easy", xpReward: 5, tags: ["saudações", "vocabulário"] },
    config: {
      question: 'Escolha a tradução correta de "Buongiorno":',
      options: [
        { id: "a", text: "Boa noite" },
        { id: "b", text: "Bom dia" },
        { id: "c", text: "Até logo" },
        { id: "d", text: "Por favor" },
      ],
      correctOptionId: "b",
      explanation: '"Buongiorno" é a saudação matinal em italiano — equivalente a "Bom dia".',
    },
  },
  {
    id: "TF-001",
    tenantId: "tenant-studio-italiano",
    title: "Come sta? é formal",
    type: "true_false",
    usedInLessonIds: ["lesson-a1-2"],
    gamification: { difficulty: "medium", xpReward: 10, tags: ["gramática", "formalidade"] },
    config: {
      statement: '"Come sta?" é uma forma formal de perguntar como alguém está.',
      correct: true,
      explanation:
        'Correto! "Come sta?" (com "Lei") é formal. Entre amigos usamos "Come stai?".',
    },
  },
  {
    id: "FB-001",
    tenantId: "tenant-studio-italiano",
    title: "Vorrei un caffè",
    type: "fill_blank",
    usedInLessonIds: ["lesson-a1-3"],
    gamification: { difficulty: "medium", xpReward: 10, tags: ["restaurante", "frases"] },
    config: {
      template: "Vorrei un caffè, {{blank1}}.",
      blanks: [{ id: "blank1", answer: "per favore", hint: "Expressão de cortesia" }],
      explanation: '"Per favore" significa "por favor" — essencial em pedidos educados.',
    },
  },
  {
    id: "WR-001",
    tenantId: "tenant-studio-italiano",
    title: "Diálogo no restaurante",
    type: "written_response",
    usedInLessonIds: ["lesson-a1-3"],
    gamification: { difficulty: "hard", xpReward: 25, tags: ["redação", "restaurante"] },
    config: {
      prompt: "Escreva um diálogo curto pedindo a conta no restaurante (3–5 frases).",
      maxWords: 80,
    },
  },
  {
    id: "MC-002",
    tenantId: "tenant-studio-italiano",
    title: "Números — venti",
    type: "multiple_choice",
    usedInLessonIds: ["lesson-a1-5"],
    gamification: { difficulty: "easy", xpReward: 5, tags: ["números", "vocabulário"] },
    config: {
      question: 'Qual é o significado de "venti"?',
      options: [
        { id: "a", text: "Dez" },
        { id: "b", text: "Vinte" },
        { id: "c", text: "Trinta" },
        { id: "d", text: "Doze" },
      ],
      correctOptionId: "b",
      explanation: '"Venti" = 20. "Dieci" = 10, "trenta" = 30.',
    },
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function createEmptyExerciseConfig(type: ExerciseType): ExerciseConfig {
  switch (type) {
    case "multiple_choice":
      return {
        question: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctOptionId: "a",
        explanation: "",
      };
    case "true_false":
      return { statement: "", correct: true, explanation: "" };
    case "fill_blank":
      return {
        template: "",
        blanks: [{ id: "blank1", answer: "", hint: "" }],
        explanation: "",
      };
    case "written_response":
      return { prompt: "", maxWords: 100 };
  }
}

export function getExercisePromptText(exercise: Exercise): string {
  switch (exercise.type) {
    case "multiple_choice":
      return (exercise.config as MultipleChoiceConfig).question;
    case "true_false":
      return (exercise.config as TrueFalseConfig).statement;
    case "fill_blank":
      return (exercise.config as FillBlankConfig).template;
    case "written_response":
      return (exercise.config as WrittenResponseConfig).prompt;
  }
}

export function resolveExerciseGamification(exercise: Exercise): ExerciseGamification {
  return exercise.gamification ?? createDefaultGamification("medium");
}

export function getExerciseUsageInCourses(
  exerciseId: string,
  courses: Course[],
): {
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  moduleSlug: string;
  courseId: string;
  courseTitle: string;
}[] {
  const usage: {
    lessonId: string;
    lessonTitle: string;
    lessonSlug: string;
    moduleSlug: string;
    courseId: string;
    courseTitle: string;
  }[] = [];
  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const hasExercise = lesson.blocks.some(
          (b) => b.type === "exercise" && (b.content as { exerciseId: string }).exerciseId === exerciseId,
        );
        if (hasExercise) {
          usage.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonSlug: lesson.slug,
            moduleSlug: mod.slug,
            courseId: course.id,
            courseTitle: course.title,
          });
        }
      }
    }
  }
  return usage;
}
