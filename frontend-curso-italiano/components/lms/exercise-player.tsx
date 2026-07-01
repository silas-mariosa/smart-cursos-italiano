"use client";

import { useState } from "react";
import type { Exercise } from "@lms-mocks/types";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ExercisePlayerProps = {
  exercise: Exercise;
  onWrittenSubmit?: (answer: string) => void;
  writtenSubmitted?: boolean;
};

export function ExercisePlayer({ exercise, onWrittenSubmit, writtenSubmitted }: ExercisePlayerProps) {
  const [selected, setSelected] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [blanks, setBlanks] = useState<Record<string, string>>({});
  const [written, setWritten] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  function handleCheckMc() {
    if (exercise.type !== "multiple_choice") return;
    const config = exercise.config as { correctOptionId: string };
    setChecked(true);
    setIsCorrect(selected === config.correctOptionId);
  }

  function handleCheckTf(value: boolean) {
    if (exercise.type !== "true_false") return;
    const config = exercise.config as { correct: boolean };
    setTfAnswer(value);
    setChecked(true);
    setIsCorrect(value === config.correct);
  }

  function handleCheckBlanks() {
    if (exercise.type !== "fill_blank") return;
    const config = exercise.config as { blanks: { id: string; answer: string }[] };
    const allCorrect = config.blanks.every(
      (b) => blanks[b.id]?.trim().toLowerCase() === b.answer.toLowerCase(),
    );
    setChecked(true);
    setIsCorrect(allCorrect);
  }

  function handleSubmitWritten() {
    if (!written.trim() || !onWrittenSubmit) return;
    onWrittenSubmit(written.trim());
  }

  const typeLabels = {
    multiple_choice: "Múltipla escolha",
    true_false: "Verdadeiro ou Falso",
    fill_blank: "Lacunas",
    written_response: "Resposta escrita",
  };

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{typeLabels[exercise.type]}</Badge>
        <span className="text-sm font-medium">{exercise.title}</span>
      </div>

      {exercise.type === "multiple_choice" && (
        <>
          <p className="font-medium">{(exercise.config as { question: string }).question}</p>
          <RadioGroup value={selected} onValueChange={setSelected} disabled={checked}>
            {(exercise.config as { options: { id: string; text: string }[] }).options.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.id} id={opt.id} />
                <Label htmlFor={opt.id}>{opt.text}</Label>
              </div>
            ))}
          </RadioGroup>
          {!checked && (
            <Button onClick={handleCheckMc} disabled={!selected}>
              Verificar resposta
            </Button>
          )}
        </>
      )}

      {exercise.type === "true_false" && (
        <>
          <p className="font-medium">{(exercise.config as { statement: string }).statement}</p>
          {!checked ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleCheckTf(true)}>
                Verdadeiro
              </Button>
              <Button variant="outline" onClick={() => handleCheckTf(false)}>
                Falso
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sua resposta: {tfAnswer ? "Verdadeiro" : "Falso"}</p>
          )}
        </>
      )}

      {exercise.type === "fill_blank" && (
        <>
          <p className="font-medium">Complete a frase:</p>
          <div className="flex flex-wrap items-center gap-2">
            <span>Vorrei un caffè,</span>
            <Input
              className="max-w-[160px]"
              placeholder="..."
              value={blanks.blank1 ?? ""}
              onChange={(e) => setBlanks({ ...blanks, blank1: e.target.value })}
              disabled={checked}
            />
            <span>.</span>
          </div>
          {!checked && (
            <Button onClick={handleCheckBlanks} disabled={!blanks.blank1?.trim()}>
              Verificar resposta
            </Button>
          )}
        </>
      )}

      {exercise.type === "written_response" && (
        <>
          <p className="font-medium">{(exercise.config as { prompt: string }).prompt}</p>
          {writtenSubmitted ? (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg p-4">
              <Clock className="size-5" />
              <span>Aguardando correção do professor</span>
            </div>
          ) : (
            <>
              <Textarea
                rows={5}
                placeholder="Escreva sua resposta aqui..."
                value={written}
                onChange={(e) => setWritten(e.target.value)}
              />
              <Button onClick={handleSubmitWritten} disabled={!written.trim()}>
                Enviar para correção
              </Button>
            </>
          )}
        </>
      )}

      {checked && isCorrect !== null && exercise.type !== "written_response" && (
        <div
          className={cn(
            "rounded-lg p-4 flex gap-3",
            isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900",
          )}
        >
          {isCorrect ? <CheckCircle2 className="size-5 shrink-0" /> : <XCircle className="size-5 shrink-0" />}
          <div>
            <p className="font-medium">{isCorrect ? "Correto!" : "Quase lá!"}</p>
            <p className="text-sm mt-1">{(exercise.config as { explanation: string }).explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
