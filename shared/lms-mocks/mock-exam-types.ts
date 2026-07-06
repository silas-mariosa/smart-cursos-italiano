export type MockExamStatus = "draft" | "published" | "archived";
export type MockExamShowResults = "immediate" | "manual" | "never";
export type MockExamAttemptStatus = "in_progress" | "submitted" | "expired";

export interface MockExamAnswer {
  exerciseId: string;
  selected: string | string[] | boolean | Record<string, string> | null;
  correct: boolean;
  timeSpentSec: number;
}

export interface MockExam {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: MockExamStatus;
  durationMinutes: number;
  passingScorePercent: number;
  shuffleQuestions: boolean;
  showResultsAfter: MockExamShowResults;
  questionIds: string[];
  tags: string[];
  courseId?: string;
  planTemplateIds?: string[];
  createdAt: string;
}

export interface MockExamAttempt {
  id: string;
  mockExamId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt?: string;
  scorePercent: number;
  passed: boolean;
  answers: MockExamAnswer[];
  status: MockExamAttemptStatus;
}

export interface AiMockExamGenerationRequest {
  prompt: string;
  quantity: number;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "true_false" | "fill_blank" | "mixed";
}
