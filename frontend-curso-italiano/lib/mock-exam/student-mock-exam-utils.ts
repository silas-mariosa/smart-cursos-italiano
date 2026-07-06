import type { MockExam, MockExamAttempt } from "@lms-mocks/mock-exam-types";
import type { StudentProfile } from "@lms-mocks/types";

export function filterExamsForStudent(exams: MockExam[], studentProfile: StudentProfile | null): MockExam[] {
  return exams.filter((exam) => {
    if (!exam.planTemplateIds?.length) return true;
    if (!studentProfile?.planTemplateId) return false;
    return exam.planTemplateIds.includes(studentProfile.planTemplateId);
  });
}

export function filterStudentAttempts(
  attempts: MockExamAttempt[],
  studentId: string | undefined,
): MockExamAttempt[] {
  if (!studentId) return [];
  return attempts
    .filter((a) => a.studentId === studentId && a.status === "submitted")
    .sort(
      (a, b) =>
        new Date(b.submittedAt ?? b.startedAt).getTime() -
        new Date(a.submittedAt ?? a.startedAt).getTime(),
    );
}

export function getBestAttemptForExam(
  attempts: MockExamAttempt[],
  examId: string,
): MockExamAttempt | undefined {
  const examAttempts = attempts.filter((a) => a.mockExamId === examId);
  if (examAttempts.length === 0) return undefined;
  return examAttempts.reduce((best, current) =>
    current.scorePercent > best.scorePercent ? current : best,
  );
}

export function getAttemptStats(attempt: MockExamAttempt) {
  const correct = attempt.answers.filter((a) => a.correct).length;
  const wrong = attempt.answers.length - correct;
  const totalTime = attempt.answers.reduce((sum, a) => sum + a.timeSpentSec, 0);
  return { correct, wrong, total: attempt.answers.length, totalTime };
}
