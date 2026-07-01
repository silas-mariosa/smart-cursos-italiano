"use client";

import { useEffect, useState } from "react";
import type {
  Exercise,
  ExerciseConfig,
  ExerciseDifficulty,
  ExerciseGamification,
  ExerciseType,
  FillBlankConfig,
  MultipleChoiceConfig,
  TrueFalseConfig,
  WrittenResponseConfig,
} from "@lms-mocks/types";
import { createEmptyExerciseConfig, createDefaultGamification } from "@lms-mocks/exercises";
import type { CreateExerciseInput } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_XP, DIFFICULTY_LABELS, TYPE_LABELS } from "@/lib/exercise-bank/constants";
import { ExercisePreview } from "./exercise-preview";
import { Sparkles } from "lucide-react";

interface ExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: Exercise | null;
  tenantId: string;
  onSave: (input: CreateExerciseInput | (Partial<Exercise> & { id: string })) => void;
}

const EXERCISE_TYPES: ExerciseType[] = ["multiple_choice", "true_false", "fill_blank", "written_response"];

export function ExerciseFormDialog({ open, onOpenChange, exercise, tenantId, onSave }: ExerciseFormDialogProps) {
  const isEdit = Boolean(exercise);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ExerciseType>("multiple_choice");
  const [config, setConfig] = useState<ExerciseConfig>(createEmptyExerciseConfig("multiple_choice"));
  const [gamification, setGamification] = useState<ExerciseGamification>(createDefaultGamification("medium"));
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!open) return;
    if (exercise) {
      setTitle(exercise.title);
      setType(exercise.type);
      setConfig(JSON.parse(JSON.stringify(exercise.config)));
      setGamification(exercise.gamification ?? createDefaultGamification("medium"));
    } else {
      setTitle("");
      setType("multiple_choice");
      setConfig(createEmptyExerciseConfig("multiple_choice"));
      setGamification(createDefaultGamification("medium"));
    }
    setTagInput("");
  }, [open, exercise]);

  function handleTypeChange(nextType: ExerciseType) {
    setType(nextType);
    setConfig(createEmptyExerciseConfig(nextType));
  }

  function handleDifficultyChange(difficulty: ExerciseDifficulty) {
    setGamification({ ...gamification, difficulty, xpReward: DEFAULT_XP[difficulty] });
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || gamification.tags.includes(tag)) return;
    setGamification({ ...gamification, tags: [...gamification.tags, tag] });
    setTagInput("");
  }

  function removeTag(tag: string) {
    setGamification({ ...gamification, tags: gamification.tags.filter((t) => t !== tag) });
  }

  function handleSubmit() {
    if (!title.trim()) return;
    if (isEdit && exercise) {
      onSave({ id: exercise.id, title: title.trim(), type, config, gamification });
    } else {
      onSave({ tenantId, title: title.trim(), type, config, gamification });
    }
    onOpenChange(false);
  }

  const draftExercise: Exercise = {
    id: exercise?.id ?? "preview",
    tenantId,
    title: title || "Nova questão",
    type,
    config,
    usedInLessonIds: exercise?.usedInLessonIds ?? [],
    gamification,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar questão" : "Nova questão"}</DialogTitle>
          <DialogDescription>
            Configure o conteúdo, feedback e recompensas de gamificação para os alunos.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="gamification">Gamificação</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título interno</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Tradução de Buongiorno"
                />
                <p className="text-xs text-muted-foreground">Visível apenas para você — o aluno vê o enunciado.</p>
              </div>
              <div className="space-y-2">
                <Label>Tipo de exercício</Label>
                <select
                  className="w-full h-10 rounded-md border px-3 text-sm bg-background"
                  value={type}
                  disabled={isEdit}
                  onChange={(e) => handleTypeChange(e.target.value as ExerciseType)}
                >
                  {EXERCISE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {type === "multiple_choice" && (
              <MultipleChoiceFields config={config as MultipleChoiceConfig} onChange={setConfig} />
            )}
            {type === "true_false" && (
              <TrueFalseFields config={config as TrueFalseConfig} onChange={setConfig} />
            )}
            {type === "fill_blank" && (
              <FillBlankFields config={config as FillBlankConfig} onChange={setConfig} />
            )}
            {type === "written_response" && (
              <WrittenResponseFields config={config as WrittenResponseConfig} onChange={setConfig} />
            )}
          </TabsContent>

          <TabsContent value="gamification" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <select
                  className="w-full h-10 rounded-md border px-3 text-sm bg-background"
                  value={gamification.difficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value as ExerciseDifficulty)}
                >
                  {(Object.keys(DIFFICULTY_LABELS) as ExerciseDifficulty[]).map((d) => (
                    <option key={d} value={d}>
                      {DIFFICULTY_LABELS[d]} · {DEFAULT_XP[d]} XP sugerido
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>XP ao acertar</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={gamification.xpReward}
                  onChange={(e) =>
                    setGamification({ ...gamification, xpReward: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags / tópicos</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ex: saudações, gramática"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {gamification.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex"
                  >
                    <Badge variant="secondary" className="cursor-pointer hover:bg-destructive/10">
                      #{tag} ×
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Gamificação automática
              </p>
              <ul className="text-muted-foreground text-xs space-y-1 list-disc pl-4">
                <li>Questões de redação geram tarefa em Correções pendentes</li>
                <li>XP é somado ao progresso do aluno ao concluir a prática</li>
                <li>Tags ajudam a filtrar e montar baterias temáticas</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="rounded-xl border p-4 bg-card">
              <ExercisePreview exercise={draftExercise} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!title.trim()}>
            {isEdit ? "Salvar alterações" : "Criar questão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MultipleChoiceFields({
  config,
  onChange,
}: {
  config: MultipleChoiceConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Pergunta</Label>
        <Textarea rows={2} value={config.question} onChange={(e) => onChange({ ...config, question: e.target.value })} />
      </div>
      <div className="space-y-3">
        <Label>Alternativas</Label>
        {config.options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="correctOption"
              checked={config.correctOptionId === opt.id}
              onChange={() => onChange({ ...config, correctOptionId: opt.id })}
            />
            <span className="font-mono text-xs w-6">{opt.id.toUpperCase()}</span>
            <Input
              value={opt.text}
              onChange={(e) =>
                onChange({
                  ...config,
                  options: config.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)),
                })
              }
              placeholder={`Alternativa ${opt.id.toUpperCase()}`}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Explicação (feedback)</Label>
        <Textarea rows={2} value={config.explanation} onChange={(e) => onChange({ ...config, explanation: e.target.value })} />
      </div>
    </div>
  );
}

function TrueFalseFields({
  config,
  onChange,
}: {
  config: TrueFalseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Affirmativa</Label>
        <Textarea rows={2} value={config.statement} onChange={(e) => onChange({ ...config, statement: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Resposta correta</Label>
        <select
          className="w-full h-10 rounded-md border px-3 text-sm bg-background"
          value={config.correct ? "true" : "false"}
          onChange={(e) => onChange({ ...config, correct: e.target.value === "true" })}
        >
          <option value="true">Verdadeiro</option>
          <option value="false">Falso</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Explicação (feedback)</Label>
        <Textarea rows={2} value={config.explanation} onChange={(e) => onChange({ ...config, explanation: e.target.value })} />
      </div>
    </div>
  );
}

function FillBlankFields({
  config,
  onChange,
}: {
  config: FillBlankConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  const blank = config.blanks[0] ?? { id: "blank1", answer: "", hint: "" };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Frase com lacuna</Label>
        <Textarea
          rows={2}
          value={config.template}
          onChange={(e) => onChange({ ...config, template: e.target.value })}
          placeholder='Ex: Vorrei un caffè, {{blank1}}.'
        />
        <p className="text-xs text-muted-foreground">Use {"{{blank1}}"} para marcar a lacuna.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Resposta esperada</Label>
          <Input
            value={blank.answer}
            onChange={(e) =>
              onChange({ ...config, blanks: [{ ...blank, answer: e.target.value }] })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Dica (opcional)</Label>
          <Input
            value={blank.hint ?? ""}
            onChange={(e) =>
              onChange({ ...config, blanks: [{ ...blank, hint: e.target.value }] })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Explicação (feedback)</Label>
        <Textarea rows={2} value={config.explanation} onChange={(e) => onChange({ ...config, explanation: e.target.value })} />
      </div>
    </div>
  );
}

function WrittenResponseFields({
  config,
  onChange,
}: {
  config: WrittenResponseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enunciado da redação</Label>
        <Textarea rows={3} value={config.prompt} onChange={(e) => onChange({ ...config, prompt: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Limite de palavras</Label>
        <Input
          type="number"
          min={20}
          max={500}
          value={config.maxWords ?? 100}
          onChange={(e) => onChange({ ...config, maxWords: Number(e.target.value) || 100 })}
        />
      </div>
      <p className="text-xs text-muted-foreground rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        Redações aparecem em Correções pendentes para você avaliar manualmente.
      </p>
    </div>
  );
}
