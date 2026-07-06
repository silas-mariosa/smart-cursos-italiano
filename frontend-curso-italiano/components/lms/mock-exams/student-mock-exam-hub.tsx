"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MockExamAnswer, MockExamAttempt } from "@lms-mocks/mock-exam-types";
import {
  getPublishedMockExamsForTenant,
  getStoredMockExamAttempts,
  setStoredMockExamAttempts,
} from "@lms-mocks/mock-exams";
import { getStoredExercises } from "@lms-mocks/storage";
import { useTenant } from "@/lib/context/TenantContext";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { useMockExamAttempts } from "@/lib/hooks/useMockExamAttempts";
import {
  filterExamsForStudent,
  filterStudentAttempts,
  getBestAttemptForExam,
} from "@/lib/mock-exam/student-mock-exam-utils";
import { MockExamAttemptDetail } from "@/components/lms/mock-exams/mock-exam-attempt-detail";
import { MockExamHistoryList } from "@/components/lms/mock-exams/mock-exam-history-list";
import { MockExamQuestion } from "@/components/lms/mock-exams/mock-exam-question";
import { MockExamResultView } from "@/components/lms/mock-exams/mock-exam-result-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, History, PlayCircle, RotateCcw } from "lucide-react";

type ViewMode = "hub" | "exam" | "result" | "detail";

export function StudentMockExamHub() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const attemptParam = searchParams.get("attempt");
  const initialTab = tabParam === "historico" ? "historico" : "disponiveis";

  const { tenant } = useTenant();
  const { persona, studentProfile } = useDemoStudent();
  const allAttempts = useMockExamAttempts();
  const exercises = getStoredExercises();

  const exams = useMemo(() => {
    return filterExamsForStudent(getPublishedMockExamsForTenant(tenant.id), studentProfile);
  }, [tenant.id, studentProfile]);

  const studentAttempts = useMemo(
    () => filterStudentAttempts(allAttempts, persona?.id),
    [allAttempts, persona?.id],
  );

  const [view, setView] = useState<ViewMode>(() =>
    attemptParam && studentAttempts.some((a) => a.id === attemptParam) ? "detail" : "hub",
  );
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<MockExamAnswer[]>([]);
  const [examStartedAt, setExamStartedAt] = useState<string | null>(null);
  const [lastFinishedAttempt, setLastFinishedAttempt] = useState<MockExamAttempt | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    attemptParam && studentAttempts.some((a) => a.id === attemptParam) ? attemptParam : null,
  );

  const activeExam = exams.find((e) => e.id === activeExamId);
  const questions = activeExam
    ? activeExam.questionIds
        .map((id) => exercises.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    : [];

  const selectedAttempt =
    studentAttempts.find((a) => a.id === selectedAttemptId) ??
    (lastFinishedAttempt?.id === selectedAttemptId ? lastFinishedAttempt : undefined);
  const selectedExam = selectedAttempt
    ? exams.find((e) => e.id === selectedAttempt.mockExamId)
    : undefined;

  function startExam(examId: string) {
    setActiveExamId(examId);
    setQuestionIndex(0);
    setAnswers([]);
    setExamStartedAt(new Date().toISOString());
    setLastFinishedAttempt(null);
    setView("exam");
  }

  function cancelExam() {
    setActiveExamId(null);
    setQuestionIndex(0);
    setAnswers([]);
    setExamStartedAt(null);
    setView("hub");
  }

  function submitAnswer(correct: boolean, selected: MockExamAnswer["selected"], timeSpentSec: number) {
    if (!activeExam || !persona || !examStartedAt) return;
    const q = questions[questionIndex];
    if (!q) return;

    const nextAnswers: MockExamAnswer[] = [
      ...answers,
      { exerciseId: q.id, selected, correct, timeSpentSec },
    ];
    setAnswers(nextAnswers);

    if (questionIndex + 1 >= questions.length) {
      const correctCount = nextAnswers.filter((a) => a.correct).length;
      const scorePercent = Math.round((correctCount / nextAnswers.length) * 100);
      const passed = scorePercent >= activeExam.passingScorePercent;
      const attempt = {
        id: `attempt-${Date.now()}`,
        mockExamId: activeExam.id,
        studentId: persona.id,
        studentName: persona.name,
        startedAt: examStartedAt,
        submittedAt: new Date().toISOString(),
        scorePercent,
        passed,
        answers: nextAnswers,
        status: "submitted" as const,
      };
      const stored = getStoredMockExamAttempts();
      setStoredMockExamAttempts([attempt, ...stored]);
      setLastFinishedAttempt(attempt);
      setActiveExamId(null);
      setView("result");
    } else {
      setQuestionIndex((i) => i + 1);
    }
  }

  function openAttemptDetail(attemptId: string) {
    setSelectedAttemptId(attemptId);
    setView("detail");
  }

  if (view === "detail" && selectedAttempt && selectedExam) {
    return (
      <MockExamAttemptDetail
        attempt={selectedAttempt}
        exam={selectedExam}
        exercises={exercises}
        onBack={() => {
          setSelectedAttemptId(null);
          setView("hub");
        }}
      />
    );
  }

  if (view === "result" && lastFinishedAttempt) {
    const exam = exams.find((e) => e.id === lastFinishedAttempt.mockExamId);
    if (!exam) {
      setView("hub");
      return null;
    }
    return (
      <MockExamResultView
        attempt={lastFinishedAttempt}
        passingScorePercent={exam.passingScorePercent}
        onViewDetails={() => openAttemptDetail(lastFinishedAttempt.id)}
        onBackToList={() => {
          setLastFinishedAttempt(null);
          setView("hub");
        }}
      />
    );
  }

  if (view === "exam" && activeExam) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">{activeExam.title}</h2>
            <p className="text-sm text-muted-foreground">
              Questão {questionIndex + 1} de {questions.length}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={cancelExam}>
            Cancelar
          </Button>
        </div>
        {questions[questionIndex] && (
          <MockExamQuestion
            key={`${questions[questionIndex]!.id}-${questionIndex}`}
            exercise={questions[questionIndex]!}
            index={questionIndex}
            total={questions.length}
            onComplete={submitAnswer}
          />
        )}
      </div>
    );
  }

  return (
    <Tabs defaultValue={initialTab} key={initialTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="disponiveis" className="gap-2">
          <PlayCircle className="size-4" />
          Disponíveis
        </TabsTrigger>
        <TabsTrigger value="historico" className="gap-2">
          <History className="size-4" />
          Histórico
          {studentAttempts.length > 0 && (
            <span className="text-xs opacity-70">({studentAttempts.length})</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="disponiveis" className="space-y-4">
        {exams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum simulado disponível para seu plano.
            </CardContent>
          </Card>
        ) : (
          exams.map((exam) => {
            const bestAttempt = getBestAttemptForExam(studentAttempts, exam.id);
            const attemptCount = studentAttempts.filter((a) => a.mockExamId === exam.id).length;
            return (
              <Card key={exam.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    {bestAttempt && (
                      <Badge variant={bestAttempt.passed ? "default" : "secondary"}>
                        Melhor: {bestAttempt.scorePercent}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{exam.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="mr-1 size-3" />
                      {exam.durationMinutes} min
                    </Badge>
                    <Badge variant="outline">{exam.questionIds.length} questões</Badge>
                    <Badge variant="outline">Nota mínima {exam.passingScorePercent}%</Badge>
                    {attemptCount > 0 && (
                      <Badge variant="outline">
                        {attemptCount} tentativa{attemptCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => startExam(exam.id)}>
                      {attemptCount > 0 ? (
                        <>
                          <RotateCcw className="mr-2 size-4" />
                          Refazer simulado
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 size-4" />
                          Iniciar simulado
                        </>
                      )}
                    </Button>
                    {bestAttempt && (
                      <Button variant="outline" onClick={() => openAttemptDetail(bestAttempt.id)}>
                        Ver último resultado
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      <TabsContent value="historico">
        <MockExamHistoryList
          attempts={studentAttempts}
          exams={exams}
          onSelectAttempt={openAttemptDetail}
        />
      </TabsContent>
    </Tabs>
  );
}
