"use client";

import type { Exercise, MultipleChoiceConfig, TrueFalseConfig, FillBlankConfig, WrittenResponseConfig } from "@lms-mocks/types";
import { getExercisePromptText, resolveExerciseGamification } from "@lms-mocks/exercises";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  TYPE_COLORS,
  TYPE_LABELS,
} from "@/lib/exercise-bank/constants";
import { cn } from "@/lib/utils";
import { Sparkles, Trophy } from "lucide-react";

interface ExercisePreviewProps {
  exercise: Exercise;
  compact?: boolean;
}

export function ExercisePreview({ exercise, compact }: ExercisePreviewProps) {
  const gamification = resolveExerciseGamification(exercise);
  const prompt = getExercisePromptText(exercise);

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px]">
          {exercise.id}
        </Badge>
        <Badge className={cn("text-[10px]", TYPE_COLORS[exercise.type])}>{TYPE_LABELS[exercise.type]}</Badge>
        <Badge className={cn("text-[10px]", DIFFICULTY_COLORS[gamification.difficulty])}>
          {DIFFICULTY_LABELS[gamification.difficulty]}
        </Badge>
        <Badge variant="secondary" className="text-[10px] gap-1">
          <Trophy className="size-3" />
          {gamification.xpReward} XP
        </Badge>
        {exercise.type === "written_response" && (
          <Badge variant="warning" className="text-[10px]">
            Correção manual
          </Badge>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Enunciado</p>
        <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>{prompt || exercise.title}</p>
      </div>

      {exercise.type === "multiple_choice" && (() => {
        const config = exercise.config as MultipleChoiceConfig;
        return (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Alternativas</p>
          <ul className="space-y-1.5">
            {config.options.map((opt) => (
              <li
                key={opt.id}
                className={cn(
                  "text-sm rounded-lg border px-3 py-2",
                  opt.id === config.correctOptionId
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "bg-muted/30",
                )}
              >
                <span className="font-mono text-xs mr-2 opacity-60">{opt.id.toUpperCase()}.</span>
                {opt.text || "—"}
                {opt.id === config.correctOptionId && (
                  <span className="ml-2 text-[10px] font-semibold text-emerald-700">correta</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        );
      })()}

      {exercise.type === "true_false" && (
        <div className="rounded-lg border px-3 py-2 text-sm bg-muted/30">
          Resposta correta:{" "}
          <span className="font-semibold">{(exercise.config as TrueFalseConfig).correct ? "Verdadeiro" : "Falso"}</span>
        </div>
      )}

      {exercise.type === "fill_blank" && (exercise.config as FillBlankConfig).blanks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Respostas esperadas</p>
          {(exercise.config as FillBlankConfig).blanks.map((blank) => (
            <div key={blank.id} className="text-sm rounded-lg border px-3 py-2 bg-muted/30">
              <span className="font-mono text-xs text-muted-foreground mr-2">{blank.id}</span>
              <span className="font-medium">{blank.answer || "—"}</span>
              {blank.hint && <span className="text-xs text-muted-foreground ml-2">· {blank.hint}</span>}
            </div>
          ))}
        </div>
      )}

      {exercise.type === "written_response" && (exercise.config as WrittenResponseConfig).maxWords && (
        <p className="text-xs text-muted-foreground">
          Limite: até {(exercise.config as WrittenResponseConfig).maxWords} palavras
        </p>
      )}

      {exercise.type !== "written_response" && "explanation" in exercise.config && exercise.config.explanation && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Feedback ao aluno</p>
            <p className="text-sm text-muted-foreground">{exercise.config.explanation}</p>
          </div>
        </>
      )}

      {gamification.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {gamification.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {!compact && (
        <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 shrink-0" />
          Geração com IA disponível na Fase 2 — por enquanto, crie e edite manualmente.
        </div>
      )}
    </div>
  );
}
