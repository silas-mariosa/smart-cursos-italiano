"use client";

import { useMemo, useState } from "react";
import type { Exercise, FillBlankConfig } from "@lms-mocks/types";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_LABELS } from "@/lib/exercise-bank/constants";

type ExercisePlayerProps = {
  exercise: Exercise;
  onWrittenSubmit?: (answer: string) => void;
  writtenSubmitted?: boolean;
};

function FillBlankPrompt({
  config,
  blanks,
  onBlankChange,
  disabled,
}: {
  config: FillBlankConfig;
  blanks: Record<string, string>;
  onBlankChange: (id: string, value: string) => void;
  disabled: boolean;
}) {
  const parts = useMemo(() => config.template.split(/(\{\{[^}]+\}\})/g), [config.template]);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm leading-relaxed">
      {parts.map((part, index) => {
        const match = part.match(/^\{\{([^}]+)\}\}$/);
        if (!match) {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {part}
            </span>
          );
        }
        const blankId = match[1];
        const blank = config.blanks.find((b) => b.id === blankId);
        return (
          <Input
            key={index}
            className="inline-flex max-w-[180px] h-8 text-sm"
            placeholder={blank?.hint || "..."}
            value={blanks[blankId] ?? ""}
            onChange={(e) => onBlankChange(blankId, e.target.value)}
            disabled={disabled}
            aria-label={blank?.hint || `Lacuna ${blankId}`}
          />
        );
      })}
    </div>
  );
}

export function ExercisePlayer({ exercise, onWrittenSubmit, writtenSubmitted }: ExercisePlayerProps) {
  const [selected, setSelected] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [blanks, setBlanks] = useState<Record<string, string>>({});
  const [written, setWritten] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [localWrittenSubmitted, setLocalWrittenSubmitted] = useState(false);

  const writtenDone = writtenSubmitted ?? localWrittenSubmitted;

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
    const config = exercise.config as FillBlankConfig;
    const allCorrect = config.blanks.every(
      (b) => blanks[b.id]?.trim().toLowerCase() === b.answer.trim().toLowerCase(),
    );
    setChecked(true);
    setIsCorrect(allCorrect);
  }

  function handleSubmitWritten() {
    if (!written.trim()) return;
    if (onWrittenSubmit) {
      onWrittenSubmit(written.trim());
    } else {
      setLocalWrittenSubmitted(true);
    }
  }

  const explanation =
    exercise.type !== "written_response" && "explanation" in exercise.config
      ? String(exercise.config.explanation ?? "")
      : "";

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{TYPE_LABELS[exercise.type]}</Badge>
        {exercise.title ? <span className="text-sm font-medium text-foreground">{exercise.title}</span> : null}
      </div>

      {exercise.type === "multiple_choice" && (
        <>
          <p className="font-medium text-sm">{(exercise.config as { question: string }).question}</p>
          <RadioGroup value={selected} onValueChange={setSelected} disabled={checked} className="space-y-2">
            {(exercise.config as { options: { id: string; text: string }[] }).options.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2 rounded-lg border px-3 py-2 bg-background">
                <RadioGroupItem value={opt.id} id={`${exercise.id}-${opt.id}`} />
                <Label htmlFor={`${exercise.id}-${opt.id}`} className="font-normal cursor-pointer flex-1">
                  {opt.text || "—"}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {!checked && (
            <Button type="button" size="sm" onClick={handleCheckMc} disabled={!selected}>
              Verificar resposta
            </Button>
          )}
        </>
      )}

      {exercise.type === "true_false" && (
        <>
          <p className="font-medium text-sm">{(exercise.config as { statement: string }).statement}</p>
          {!checked ? (
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => handleCheckTf(true)}>
                Verdadeiro
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCheckTf(false)}>
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
          <p className="text-sm text-muted-foreground">Complete a frase:</p>
          <FillBlankPrompt
            config={exercise.config as FillBlankConfig}
            blanks={blanks}
            onBlankChange={(id, value) => setBlanks((prev) => ({ ...prev, [id]: value }))}
            disabled={checked}
          />
          {!checked && (
            <Button
              type="button"
              size="sm"
              onClick={handleCheckBlanks}
              disabled={!(exercise.config as FillBlankConfig).blanks.every((b) => blanks[b.id]?.trim())}
            >
              Verificar resposta
            </Button>
          )}
        </>
      )}

      {exercise.type === "written_response" && (
        <>
          <p className="font-medium text-sm">{(exercise.config as { prompt: string }).prompt}</p>
          {writtenDone ? (
            <div className="flex items-center gap-2 text-amber-800 bg-amber-50 rounded-lg p-4 text-sm">
              <Clock className="size-5 shrink-0" />
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
              <Button type="button" size="sm" onClick={handleSubmitWritten} disabled={!written.trim()}>
                Enviar para correção
              </Button>
            </>
          )}
        </>
      )}

      {checked && isCorrect !== null && exercise.type !== "written_response" && (
        <div
          className={cn(
            "rounded-lg p-4 flex gap-3 text-sm",
            isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900",
          )}
        >
          {isCorrect ? <CheckCircle2 className="size-5 shrink-0" /> : <XCircle className="size-5 shrink-0" />}
          <div>
            <p className="font-medium">{isCorrect ? "Correto!" : "Quase lá!"}</p>
            {explanation ? <p className="mt-1 opacity-90">{explanation}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
