"use client";

import { useEffect, useId, useState } from "react";
import type { ActivitySource } from "@lms-mocks/page-builder-types";
import type {
  Exercise,
  ExerciseConfig,
  ExerciseType,
  FillBlankConfig,
  MultipleChoiceConfig,
  TrueFalseConfig,
  WrittenResponseConfig,
} from "@lms-mocks/types";
import { createEmptyExerciseConfig, createDefaultGamification, getExercisePromptText } from "@lms-mocks/exercises";
import { useMockStore } from "@/lib/mock-store";
import { TYPE_LABELS } from "@/lib/exercise-bank/constants";
import { ExercisePreview } from "@/components/lms/exercise-bank/exercise-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExercisePlayer } from "@/components/lms/exercise-player";
import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, PenLine, Wand2, Plus, Trash2 } from "lucide-react";

interface ActivityEditorProps {
  props: Record<string, unknown>;
  onChange: (props: Record<string, unknown>) => void;
}

const AI_SAMPLES: Record<ExerciseType, ExerciseConfig> = {
  multiple_choice: {
    question: "Escolha a tradução correta:",
    options: [
      { id: "a", text: "Opção A" },
      { id: "b", text: "Opção B (correta)" },
      { id: "c", text: "Opção C" },
    ],
    correctOptionId: "b",
    explanation: "Gerado pela IA — revise antes de publicar.",
  },
  true_false: {
    statement: "Esta frase está gramaticalmente correta.",
    correct: true,
    explanation: "Gerado pela IA — revise antes de publicar.",
  },
  fill_blank: {
    template: "Complete: Io {{blank1}} italiano.",
    blanks: [{ id: "blank1", answer: "parlo", hint: "Verbo falar" }],
    explanation: "Gerado pela IA — revise antes de publicar.",
  },
  written_response: {
    prompt: "Escreva 3 frases usando o vocabulário da aula.",
    maxWords: 60,
  },
};

const SOURCE_OPTIONS: { id: ActivitySource; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "bank", label: "Banco", icon: BookOpen },
  { id: "ai", label: "IA", icon: Wand2 },
  { id: "manual", label: "Manual", icon: PenLine },
];

function normalizeManualConfig(type: ExerciseType, config: unknown): ExerciseConfig {
  const defaults = createEmptyExerciseConfig(type);
  if (!config || typeof config !== "object") return defaults;

  if (type === "multiple_choice") {
    const raw = config as Partial<MultipleChoiceConfig>;
    const base = defaults as MultipleChoiceConfig;
    const options =
      Array.isArray(raw.options) && raw.options.length > 0
        ? raw.options.map((opt, i) => ({
            id: opt?.id ?? String.fromCharCode(97 + i),
            text: opt?.text ?? "",
          }))
        : base.options;
    const correctOptionId = options.some((o) => o.id === raw.correctOptionId)
      ? raw.correctOptionId!
      : options[0]?.id ?? "a";
    return {
      question: raw.question ?? "",
      options,
      correctOptionId,
      explanation: raw.explanation ?? "",
    };
  }

  if (type === "true_false") {
    const raw = config as Partial<TrueFalseConfig>;
    const base = defaults as TrueFalseConfig;
    return {
      statement: raw.statement ?? base.statement,
      correct: raw.correct ?? base.correct,
      explanation: raw.explanation ?? base.explanation,
    };
  }

  if (type === "fill_blank") {
    const raw = config as Partial<FillBlankConfig>;
    const base = defaults as FillBlankConfig;
    const blanks =
      Array.isArray(raw.blanks) && raw.blanks.length > 0
        ? raw.blanks.map((b, i) => ({
            id: b?.id ?? `blank${i + 1}`,
            answer: b?.answer ?? "",
            hint: b?.hint ?? "",
          }))
        : base.blanks;
    return {
      template: raw.template ?? base.template,
      blanks,
      explanation: raw.explanation ?? base.explanation,
    };
  }

  const raw = config as Partial<WrittenResponseConfig>;
  const base = defaults as WrittenResponseConfig;
  return {
    prompt: raw.prompt ?? base.prompt,
    maxWords: raw.maxWords ?? base.maxWords,
  };
}

function ensureManualDefaults(props: Record<string, unknown>): Record<string, unknown> {
  const manualType = (props.manualType as ExerciseType) ?? "multiple_choice";
  return {
    ...props,
    source: "manual" as const,
    manualType,
    manualTitle: String(props.manualTitle ?? props.title ?? "Nova atividade"),
    manualConfig: normalizeManualConfig(manualType, props.manualConfig),
  };
}

function needsManualConfigInit(props: Record<string, unknown>): boolean {
  if ((props.source as ActivitySource) !== "manual") return false;
  const type = (props.manualType as ExerciseType) ?? "multiple_choice";
  if (!props.manualConfig) return true;
  if (type === "multiple_choice") {
    return !Array.isArray((props.manualConfig as MultipleChoiceConfig).options);
  }
  if (type === "fill_blank") {
    return !Array.isArray((props.manualConfig as FillBlankConfig).blanks);
  }
  return false;
}

export function ActivityEditor({ props, onChange }: ActivityEditorProps) {
  const { exercises } = useMockStore();
  const source = (props.source as ActivitySource) ?? "bank";
  const [aiPrompt, setAiPrompt] = useState(String(props.aiPrompt ?? ""));
  const [generating, setGenerating] = useState(false);
  const fieldId = useId();

  const set = (key: string, value: unknown) => onChange({ ...props, [key]: value });

  const manualType = (props.manualType as ExerciseType) ?? "multiple_choice";
  const manualConfig = normalizeManualConfig(manualType, props.manualConfig);

  useEffect(() => {
    if (needsManualConfigInit(props)) {
      onChange(ensureManualDefaults(props));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init when manualConfig is missing or invalid
  }, [source, props.manualConfig, props.manualType]);

  function selectSource(next: ActivitySource) {
    if (next === "manual") {
      onChange(ensureManualDefaults({ ...props, source: next }));
      return;
    }
    onChange({ ...props, source: next });
  }

  async function handleGenerateAi() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const manualType = (props.manualType as ExerciseType) ?? "multiple_choice";
    onChange(
      ensureManualDefaults({
        ...props,
        source: "manual",
        manualType,
        manualTitle: aiPrompt.trim() || "Atividade gerada por IA",
        manualConfig: AI_SAMPLES[manualType],
        aiPrompt,
      }),
    );
    setGenerating(false);
  }

  const selectedExercise = exercises.find((e) => e.id === props.exerciseId);

  const manualExercise: Exercise | null =
    source === "manual"
      ? {
          id: "draft",
          tenantId: "tenant",
          title: String(props.manualTitle ?? "Atividade"),
          type: manualType,
          usedInLessonIds: [],
          gamification: createDefaultGamification("medium"),
          config: manualConfig,
        }
      : null;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Título da atividade</Label>
        <Input value={String(props.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder="Exercício 1:" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Instruções</Label>
        <Textarea rows={2} value={String(props.instructions ?? "")} onChange={(e) => set("instructions", e.target.value)} placeholder="Instruções para o aluno..." />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Origem do exercício</Label>
        <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Origem do exercício">
          {SOURCE_OPTIONS.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              role="tab"
              aria-selected={source === id}
              tabIndex={0}
              onClick={() => selectSource(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectSource(id);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-md border py-1.5 text-[10px] cursor-pointer transition-colors",
                source === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent",
              )}
            >
              <Icon className="size-3" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {source === "bank" && (
        <div className="space-y-2">
          <Label className="text-xs">Exercício do banco</Label>
          <select
            className="w-full h-9 border rounded-md px-2 text-xs bg-background"
            value={String(props.exerciseId ?? "")}
            onChange={(e) => set("exerciseId", e.target.value || undefined)}
          >
            <option value="">Selecione...</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                [{ex.id}] {ex.title} — {TYPE_LABELS[ex.type]}
              </option>
            ))}
          </select>
          {selectedExercise && (
            <div className="border rounded-lg p-2 bg-muted/30">
              <ExercisePreview exercise={selectedExercise} compact />
            </div>
          )}
        </div>
      )}

      {source === "ai" && (
        <div className="space-y-2">
          <Label className="text-xs">Descreva o exercício desejado</Label>
          <Textarea
            rows={3}
            value={aiPrompt}
            onChange={(e) => {
              setAiPrompt(e.target.value);
              set("aiPrompt", e.target.value);
            }}
            placeholder="Ex: Crie 1 questão de múltipla escolha sobre artigos definidos em inglês..."
          />
          <div className="space-y-1">
            <Label className="text-xs">Tipo sugerido</Label>
            <select
              className="w-full h-8 border rounded-md px-2 text-xs bg-background"
              value={String(props.manualType ?? "multiple_choice")}
              onChange={(e) => set("manualType", e.target.value)}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" size="sm" className="w-full" disabled={generating} onClick={handleGenerateAi}>
            <Sparkles className="size-3 mr-1" />
            {generating ? "Gerando..." : "Gerar com IA"}
          </Button>
          <p className="text-[10px] text-muted-foreground">A IA cria um rascunho editável. Revise antes de publicar.</p>
        </div>
      )}

      {source === "manual" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <select
              className="w-full h-8 border rounded-md px-2 text-xs bg-background"
              value={manualType}
              onChange={(e) => {
                const t = e.target.value as ExerciseType;
                onChange({
                  ...props,
                  manualType: t,
                  manualConfig: createEmptyExerciseConfig(t),
                });
              }}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Enunciado</Label>
            <Input value={String(props.manualTitle ?? "")} onChange={(e) => set("manualTitle", e.target.value)} />
          </div>
          <ManualConfigFields
            key={manualType}
            fieldId={fieldId}
            type={manualType}
            config={manualConfig}
            onChange={(config) => set("manualConfig", config)}
          />
          {manualExercise && (
            <div className="border rounded-lg p-2 bg-muted/30">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">Pré-visualização</p>
              <ExercisePreview exercise={manualExercise} compact />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ManualConfigFields({
  fieldId,
  type,
  config,
  onChange,
}: {
  fieldId: string;
  type: ExerciseType;
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  if (type === "multiple_choice") {
    const c = config as MultipleChoiceConfig;
    const options = c.options ?? [];
    return (
      <div className="space-y-2">
        <Textarea rows={2} className="text-xs" value={c.question ?? ""} onChange={(e) => onChange({ ...c, question: e.target.value })} placeholder="Pergunta" />
        {options.map((opt, i) => (
          <div key={opt.id} className="flex gap-1 items-center">
            <input
              type="radio"
              name={`${fieldId}-correct`}
              checked={c.correctOptionId === opt.id}
              onChange={() => onChange({ ...c, correctOptionId: opt.id })}
            />
            <Input
              className="h-7 text-xs flex-1"
              value={opt.text}
              onChange={(e) => {
                const nextOptions = options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o));
                onChange({ ...c, options: nextOptions });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              disabled={options.length <= 2}
              onClick={() => {
                const nextOptions = options.filter((_, j) => j !== i);
                const correctOptionId = nextOptions.some((o) => o.id === c.correctOptionId)
                  ? c.correctOptionId
                  : nextOptions[0]?.id ?? "a";
                onChange({ ...c, options: nextOptions, correctOptionId });
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={options.length >= 6}
          onClick={() => {
            const nextId = String.fromCharCode(97 + options.length);
            onChange({ ...c, options: [...options, { id: nextId, text: "" }] });
          }}
        >
          <Plus className="size-3 mr-1" />
          Alternativa
        </Button>
      </div>
    );
  }
  if (type === "true_false") {
    const c = config as import("@lms-mocks/types").TrueFalseConfig;
    return (
      <div className="space-y-2">
        <Textarea rows={2} className="text-xs" value={c.statement} onChange={(e) => onChange({ ...c, statement: e.target.value })} />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={c.correct} onChange={(e) => onChange({ ...c, correct: e.target.checked })} />
          Afirmativa correta
        </label>
      </div>
    );
  }
  if (type === "fill_blank") {
    const c = config as FillBlankConfig;
    const blanks = c.blanks ?? [];
    return (
      <div className="space-y-2">
        <Textarea rows={2} className="text-xs" value={c.template ?? ""} onChange={(e) => onChange({ ...c, template: e.target.value })} placeholder="Use {{blank1}} para lacunas" />
        {blanks.map((b, i) => (
          <Input
            key={b.id}
            className="h-7 text-xs"
            value={b.answer}
            placeholder={`Resposta ${i + 1}`}
            onChange={(e) => {
              const nextBlanks = blanks.map((bl, j) => (j === i ? { ...bl, answer: e.target.value } : bl));
              onChange({ ...c, blanks: nextBlanks });
            }}
          />
        ))}
      </div>
    );
  }
  const c = config as import("@lms-mocks/types").WrittenResponseConfig;
  return (
    <Textarea rows={3} className="text-xs" value={c.prompt} onChange={(e) => onChange({ ...c, prompt: e.target.value })} placeholder="Prompt de redação" />
  );
}

export function activityPropsToExercise(
  props: Record<string, unknown>,
  bankExercise?: Exercise,
): Exercise | null {
  const source = (props.source as ActivitySource) ?? "bank";

  if (source === "bank") {
    return bankExercise ?? null;
  }

  if (source === "manual" || source === "ai") {
    const manualType = (props.manualType as ExerciseType) ?? "multiple_choice";
    if (source === "ai" && !props.manualConfig) return null;
    return {
      id: "inline",
      tenantId: "tenant",
      title: String(props.manualTitle ?? props.title ?? "Atividade"),
      type: manualType,
      usedInLessonIds: [],
      gamification: createDefaultGamification("medium"),
      config: normalizeManualConfig(manualType, props.manualConfig),
    };
  }

  return null;
}

/** Pré-visualização interativa no canvas — mesma experiência do aluno. */
export function ActivityPreviewContent({
  props,
  bankExercise,
}: {
  props: Record<string, unknown>;
  bankExercise?: Exercise;
}) {
  const source = (props.source as ActivitySource) ?? "bank";
  const exercise = activityPropsToExercise(props, bankExercise);

  return (
    <div className="space-y-3">
      {exercise ? (
        <ExercisePlayer exercise={exercise} />
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center">
          {source === "bank" ? (
            <p className="text-xs text-muted-foreground">Selecione um exercício do banco no painel de propriedades.</p>
          ) : source === "ai" ? (
            <p className="text-xs text-muted-foreground">Gere ou configure o exercício por IA no painel de propriedades.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Configure o exercício manual no painel de propriedades.</p>
          )}
        </div>
      )}
    </div>
  );
}
