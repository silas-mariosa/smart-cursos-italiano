import type { Exercise } from "@lms-mocks/types";
import type { MockExamAnswer } from "@lms-mocks/mock-exam-types";

export function checkExerciseAnswer(
  exercise: Exercise,
  selected: MockExamAnswer["selected"],
): boolean {
  switch (exercise.type) {
    case "multiple_choice": {
      const config = exercise.config as { correctOptionId: string };
      return selected === config.correctOptionId;
    }
    case "true_false": {
      const config = exercise.config as { correct: boolean };
      return selected === config.correct;
    }
    case "fill_blank": {
      const config = exercise.config as { blanks: { id: string; answer: string }[] };
      if (typeof selected !== "object" || selected === null || Array.isArray(selected)) return false;
      return config.blanks.every(
        (b) =>
          String((selected as Record<string, string>)[b.id] ?? "")
            .trim()
            .toLowerCase() === b.answer.toLowerCase(),
      );
    }
    default:
      return false;
  }
}

export function getCorrectAnswerLabel(exercise: Exercise): string {
  switch (exercise.type) {
    case "multiple_choice": {
      const config = exercise.config as {
        options: { id: string; text: string }[];
        correctOptionId: string;
      };
      return config.options.find((o) => o.id === config.correctOptionId)?.text ?? config.correctOptionId;
    }
    case "true_false": {
      const config = exercise.config as { correct: boolean };
      return config.correct ? "Verdadeiro" : "Falso";
    }
    case "fill_blank": {
      const config = exercise.config as { blanks: { id: string; answer: string }[] };
      return config.blanks.map((b) => b.answer).join(", ");
    }
    case "written_response":
      return "Correção manual";
    default:
      return "—";
  }
}

export function formatSelectedAnswer(
  exercise: Exercise,
  selected: MockExamAnswer["selected"],
): string {
  if (selected === null || selected === undefined) return "Sem resposta";

  switch (exercise.type) {
    case "multiple_choice": {
      const config = exercise.config as { options: { id: string; text: string }[] };
      if (typeof selected !== "string") return String(selected);
      return config.options.find((o) => o.id === selected)?.text ?? selected;
    }
    case "true_false":
      return selected === true ? "Verdadeiro" : selected === false ? "Falso" : String(selected);
    case "fill_blank": {
      if (typeof selected !== "object" || selected === null || Array.isArray(selected)) {
        return String(selected);
      }
      return Object.values(selected as Record<string, string>).join(", ") || "—";
    }
    default:
      return String(selected);
  }
}

export function getExercisePrompt(exercise: Exercise): string {
  switch (exercise.type) {
    case "multiple_choice":
      return (exercise.config as { question: string }).question;
    case "true_false":
      return (exercise.config as { statement: string }).statement;
    case "fill_blank":
      return (exercise.config as { template: string }).template.replace(/\{\{(\w+)\}\}/g, "___");
    case "written_response":
      return (exercise.config as { prompt: string }).prompt;
    default:
      return exercise.title;
  }
}

export function getExerciseExplanation(exercise: Exercise): string | undefined {
  const config = exercise.config as { explanation?: string };
  return config.explanation;
}

export function formatAttemptDuration(startedAt: string, submittedAt?: string): string {
  if (!submittedAt) return "—";
  const sec = Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000);
  const mins = Math.floor(sec / 60);
  const rest = sec % 60;
  return mins > 0 ? `${mins} min ${rest}s` : `${rest}s`;
}

export function formatAttemptDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
