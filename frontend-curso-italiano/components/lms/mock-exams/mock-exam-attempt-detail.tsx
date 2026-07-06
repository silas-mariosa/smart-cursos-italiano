"use client";

import type { Exercise } from "@lms-mocks/types";
import type { MockExam, MockExamAttempt } from "@lms-mocks/mock-exam-types";
import {
  formatAttemptDate,
  formatAttemptDuration,
  formatSelectedAnswer,
  getCorrectAnswerLabel,
  getExerciseExplanation,
  getExercisePrompt,
} from "@/lib/mock-exam/exercise-answer-utils";
import { getAttemptStats } from "@/lib/mock-exam/student-mock-exam-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowLeft, Clock, Target } from "lucide-react";

interface MockExamAttemptDetailProps {
  attempt: MockExamAttempt;
  exam: MockExam;
  exercises: Exercise[];
  onBack: () => void;
}

function AnswerReviewItem({
  exercise,
  answer,
  index,
}: {
  exercise: Exercise | undefined;
  answer: MockExamAttempt["answers"][number];
  index: number;
}) {
  const explanation = exercise ? getExerciseExplanation(exercise) : undefined;

  return (
    <li
      className={`rounded-lg border p-4 text-sm ${
        answer.correct ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {answer.correct ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-medium">
              {index + 1}. {exercise?.title ?? answer.exerciseId}
            </p>
            {exercise && (
              <p className="mt-1 text-muted-foreground">{getExercisePrompt(exercise)}</p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md bg-background/80 px-3 py-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Sua resposta</p>
              <p className={answer.correct ? "text-emerald-800" : "text-red-800"}>
                {exercise ? formatSelectedAnswer(exercise, answer.selected) : String(answer.selected)}
              </p>
            </div>
            {!answer.correct && exercise && (
              <div className="rounded-md bg-background/80 px-3 py-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Resposta correta</p>
                <p className="text-emerald-800">{getCorrectAnswerLabel(exercise)}</p>
              </div>
            )}
          </div>
          {explanation && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Explicação: </span>
              {explanation}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Tempo: {answer.timeSpentSec}s</p>
        </div>
      </div>
    </li>
  );
}

export function MockExamAttemptDetail({ attempt, exam, exercises, onBack }: MockExamAttemptDetailProps) {
  const stats = getAttemptStats(attempt);
  const wrongAnswers = attempt.answers.filter((a) => !a.correct);
  const correctAnswers = attempt.answers.filter((a) => a.correct);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold">{exam.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Realizado em {formatAttemptDate(attempt.submittedAt ?? attempt.startedAt)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{attempt.scorePercent}%</p>
            <Badge className="mt-2" variant={attempt.passed ? "default" : "secondary"}>
              {attempt.passed ? "Aprovado" : "Reprovado"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Nota mínima: {exam.passingScorePercent}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Target className="size-4 text-muted-foreground" />
              <span>
                {stats.correct} acertos · {stats.wrong} erros
              </span>
            </div>
            <Progress value={(stats.correct / stats.total) * 100} />
            <p className="text-xs text-muted-foreground">{stats.total} questões no total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              <span>{formatAttemptDuration(attempt.startedAt, attempt.submittedAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio por questão: {Math.round(stats.totalTime / stats.total)}s
            </p>
          </CardContent>
        </Card>
      </div>

      {wrongAnswers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <XCircle className="size-5" />
              Questões que você errou ({wrongAnswers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {wrongAnswers.map((ans) => {
                const exercise = exercises.find((e) => e.id === ans.exerciseId);
                const index = attempt.answers.findIndex((a) => a.exerciseId === ans.exerciseId);
                return (
                  <AnswerReviewItem
                    key={ans.exerciseId}
                    exercise={exercise}
                    answer={ans}
                    index={index}
                  />
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {correctAnswers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Questões corretas ({correctAnswers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {correctAnswers.map((ans) => {
                const exercise = exercises.find((e) => e.id === ans.exerciseId);
                const index = attempt.answers.findIndex((a) => a.exerciseId === ans.exerciseId);
                return (
                  <AnswerReviewItem
                    key={ans.exerciseId}
                    exercise={exercise}
                    answer={ans}
                    index={index}
                  />
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
