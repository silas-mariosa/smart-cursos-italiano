"use client";

import type { Exercise } from "@lms-mocks/types";
import type { LessonPracticeSettings } from "@lms-mocks/lesson-practice-types";
import type { Flashcard, SimulatorScenario } from "@lms-mocks/practice-types";
import { ExercisePreview } from "@/components/lms/exercise-bank/exercise-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LessonPracticeStudentViewProps = {
  practice: LessonPracticeSettings;
  exercises: (Exercise | undefined)[];
  flashcards: Flashcard[];
  scenarios: SimulatorScenario[];
};

export function LessonPracticeStudentView({
  practice,
  exercises,
  flashcards,
  scenarios,
}: LessonPracticeStudentViewProps) {
  const defaultTab = practice.modules.quizzes.enabled
    ? "quizzes"
    : practice.modules.flashcards.enabled
      ? "flashcards"
      : "simulator";

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        {practice.modules.quizzes.enabled && (
          <TabsTrigger value="quizzes">Quizzes ({exercises.length})</TabsTrigger>
        )}
        {practice.modules.flashcards.enabled && (
          <TabsTrigger value="flashcards">Flashcards ({flashcards.length})</TabsTrigger>
        )}
        {practice.modules.simulator.enabled && (
          <TabsTrigger value="simulator">Simulador ({scenarios.length})</TabsTrigger>
        )}
      </TabsList>

      {practice.modules.quizzes.enabled && (
        <TabsContent value="quizzes" className="space-y-4 mt-4">
          {practice.modules.quizzes.intro && (
            <p className="text-sm text-muted-foreground">{practice.modules.quizzes.intro}</p>
          )}
          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum exercício vinculado.</p>
          ) : (
            exercises.map((ex) =>
              ex ? (
                <Card key={ex.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{ex.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExercisePreview exercise={ex} />
                  </CardContent>
                </Card>
              ) : null,
            )
          )}
        </TabsContent>
      )}

      {practice.modules.flashcards.enabled && (
        <TabsContent value="flashcards" className="space-y-3 mt-4">
          {practice.modules.flashcards.intro && (
            <p className="text-sm text-muted-foreground">{practice.modules.flashcards.intro}</p>
          )}
          {flashcards.map((fc) => (
            <Card key={fc.id}>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Frente</p>
                <p className="font-medium">{fc.front}</p>
                <p className="text-sm text-muted-foreground mt-2">Verso</p>
                <p>{fc.back}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      )}

      {practice.modules.simulator.enabled && (
        <TabsContent value="simulator" className="space-y-3 mt-4">
          {practice.modules.simulator.intro && (
            <p className="text-sm text-muted-foreground">{practice.modules.simulator.intro}</p>
          )}
          {scenarios.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.description}</p>
                <p className="text-sm mt-2">
                  Cenário: {s.setting} · {s.suggestedResponses.length} respostas sugeridas
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      )}
    </Tabs>
  );
}
