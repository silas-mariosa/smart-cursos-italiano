"use client";

import { useState } from "react";
import type { Exercise } from "@lms-mocks/types";
import type { MockExamAnswer } from "@lms-mocks/mock-exam-types";
import { checkExerciseAnswer } from "@/lib/mock-exam/exercise-answer-utils";
import { ExercisePlayer } from "@/components/lms/exercise-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface MockExamQuestionProps {
  exercise: Exercise;
  index: number;
  total: number;
  onComplete: (correct: boolean, selected: MockExamAnswer["selected"], timeSpentSec: number) => void;
}

export function MockExamQuestion({ exercise, index, total, onComplete }: MockExamQuestionProps) {
  const [startedAt] = useState(() => Date.now());
  const [selected, setSelected] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [blanks, setBlanks] = useState<Record<string, string>>({});

  function handleSubmit() {
    let answer: MockExamAnswer["selected"] = null;

    if (exercise.type === "multiple_choice") {
      answer = selected;
    } else if (exercise.type === "true_false") {
      answer = tfAnswer;
    } else if (exercise.type === "fill_blank") {
      answer = blanks;
    }

    const timeSpentSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const correct = checkExerciseAnswer(exercise, answer);
    onComplete(correct, answer, timeSpentSec);
  }

  const canSubmit =
    exercise.type === "multiple_choice"
      ? Boolean(selected)
      : exercise.type === "true_false"
        ? tfAnswer !== null
        : exercise.type === "fill_blank"
          ? Object.values(blanks).some((v) => v.trim())
          : false;

  if (exercise.type === "written_response") {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Progress value={((index + 1) / total) * 100} />
          <p className="text-sm text-muted-foreground">
            Questão {index + 1} de {total}
          </p>
          <ExercisePlayer exercise={exercise} />
          <p className="text-sm text-muted-foreground">
            Questões dissertativas não fazem parte deste simulado automático.
          </p>
          <Button onClick={() => onComplete(false, "", 0)}>Pular questão</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Progress value={((index + 1) / total) * 100} />
        <p className="text-sm text-muted-foreground">
          Questão {index + 1} de {total}
        </p>

        {exercise.type === "multiple_choice" && (
          <>
            <p className="font-medium">{(exercise.config as { question: string }).question}</p>
            <RadioGroup value={selected} onValueChange={setSelected}>
              {(exercise.config as { options: { id: string; text: string }[] }).options.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.id} id={`${exercise.id}-${opt.id}`} />
                  <Label htmlFor={`${exercise.id}-${opt.id}`}>{opt.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </>
        )}

        {exercise.type === "true_false" && (
          <>
            <p className="font-medium">{(exercise.config as { statement: string }).statement}</p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={tfAnswer === true ? "default" : "outline"}
                onClick={() => setTfAnswer(true)}
              >
                Verdadeiro
              </Button>
              <Button
                type="button"
                variant={tfAnswer === false ? "default" : "outline"}
                onClick={() => setTfAnswer(false)}
              >
                Falso
              </Button>
            </div>
          </>
        )}

        {exercise.type === "fill_blank" && (
          <>
            <p className="font-medium">Complete a frase:</p>
            <div className="flex flex-wrap items-center gap-2">
              {(exercise.config as { template: string; blanks: { id: string }[] }).blanks.map(
                (blank, i) => (
                  <Input
                    key={blank.id}
                    className="max-w-[160px]"
                    placeholder={`lacuna ${i + 1}`}
                    value={blanks[blank.id] ?? ""}
                    onChange={(e) => setBlanks({ ...blanks, [blank.id]: e.target.value })}
                  />
                ),
              )}
            </div>
          </>
        )}

        <Button onClick={handleSubmit} disabled={!canSubmit}>
          Confirmar resposta
        </Button>
      </CardContent>
    </Card>
  );
}
