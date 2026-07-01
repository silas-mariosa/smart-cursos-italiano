"use client";

import type { Exercise } from "@lms-mocks/types";
import type { LessonBlock } from "@lms-mocks/types";
import { GripVertical, Plus, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Múltipla escolha",
  true_false: "V. ou F.",
  fill_blank: "Lacuna",
  written_response: "Redação",
};

const TYPE_COLORS: Record<string, string> = {
  multiple_choice: "bg-blue-100 text-blue-800",
  true_false: "bg-purple-100 text-purple-800",
  fill_blank: "bg-amber-100 text-amber-800",
  written_response: "bg-rose-100 text-rose-800",
};

interface QuizzesPanelProps {
  exerciseBlocks: LessonBlock[];
  exercises: Exercise[];
  intro: string;
  onIntroChange: (intro: string) => void;
  onChange: (blocks: LessonBlock[]) => void;
}

export function QuizzesPanel({ exerciseBlocks, exercises, intro, onIntroChange, onChange }: QuizzesPanelProps) {
  const [filter, setFilter] = useState<string>("all");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const filteredBank = filter === "all" ? exercises : exercises.filter((e) => e.type === filter);

  function addBlock(exerciseId?: string) {
    const id = `block-${Date.now()}`;
    onChange([
      ...exerciseBlocks,
      { id, type: "exercise", order: exerciseBlocks.length + 1, content: { exerciseId: exerciseId ?? exercises[0]?.id ?? "MC-001" } },
    ]);
  }

  function removeBlock(index: number) {
    onChange(exerciseBlocks.filter((_, i) => i !== index));
  }

  function duplicateBlock(index: number) {
    const block = exerciseBlocks[index];
    onChange([
      ...exerciseBlocks.slice(0, index + 1),
      { ...block, id: `block-${Date.now()}` },
      ...exerciseBlocks.slice(index + 1),
    ]);
  }

  function updateExerciseId(index: number, exerciseId: string) {
    onChange(exerciseBlocks.map((b, i) => (i === index ? { ...b, content: { exerciseId } } : b)));
  }

  function reorder(sourceId: string, targetId: string, after: boolean) {
    const blocks = [...exerciseBlocks];
    const si = blocks.findIndex((b) => b.id === sourceId);
    const ti = blocks.findIndex((b) => b.id === targetId);
    if (si === -1 || ti === -1) return;
    const [moved] = blocks.splice(si, 1);
    let insert = ti;
    if (si < ti) insert = ti - 1;
    if (after) insert += 1;
    blocks.splice(insert, 0, moved);
    onChange(blocks);
  }

  function exercisePreview(ex: Exercise): string {
    return ex.title;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs">Introdução exibida ao aluno</Label>
        <Input value={intro} onChange={(e) => onIntroChange(e.target.value)} placeholder="Texto de boas-vindas da seção de quizzes..." />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">Quizzes vinculados ({exerciseBlocks.length})</h3>
          <p className="text-xs text-muted-foreground">Arraste para reordenar · Exercícios do banco global</p>
        </div>
        <Button type="button" size="sm" onClick={() => addBlock()}>
          <Plus className="size-4 mr-1" /> Adicionar quiz
        </Button>
      </div>

      <div className="space-y-3 min-h-[120px]">
        {exerciseBlocks.map((block, index) => {
          const exerciseId = (block.content as { exerciseId: string }).exerciseId;
          const ex = exercises.find((item) => item.id === exerciseId);
          return (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDraggedId(block.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId && draggedId !== block.id) reorder(draggedId, block.id, true);
              }}
              className={cn(
                "rounded-xl border bg-card p-4 space-y-3 transition-all",
                draggedId === block.id && "opacity-50",
                previewId === block.id && "ring-2 ring-primary/30",
              )}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground cursor-grab shrink-0" />
                <Badge variant="outline">Quiz {index + 1}</Badge>
                {ex && (
                  <Badge className={cn("text-[10px]", TYPE_COLORS[ex.type])}>{TYPE_LABELS[ex.type] ?? ex.type}</Badge>
                )}
                <div className="ml-auto flex gap-0.5">
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreviewId(previewId === block.id ? null : block.id)}>
                    <Eye className="size-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => duplicateBlock(index)}>
                    <Copy className="size-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeBlock(index)}>
                    <Trash2 className="size-3.5 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Exercício do banco</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={exerciseId}
                  onChange={(e) => updateExerciseId(index, e.target.value)}
                >
                  {exercises.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} — {item.title}
                    </option>
                  ))}
                </select>
              </div>

              {previewId === block.id && ex && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm border-l-4 border-primary">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Preview</p>
                  <p>{exercisePreview(ex)}</p>
                </div>
              )}
            </div>
          );
        })}

        {exerciseBlocks.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <Plus className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum quiz vinculado</p>
            <p className="text-xs mt-1">Adicione exercícios do banco ou clique em um item abaixo</p>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Banco rápido</p>
          <div className="flex gap-1 flex-wrap">
            {["all", "multiple_choice", "true_false", "fill_blank", "written_response"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full border transition-colors",
                  filter === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
                )}
              >
                {t === "all" ? "Todos" : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {filteredBank.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => addBlock(ex.id)}
              className="text-left p-2 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-1 mb-0.5">
                <Badge variant="outline" className="text-[10px]">{ex.id}</Badge>
                <Badge className={cn("text-[10px]", TYPE_COLORS[ex.type])}>{TYPE_LABELS[ex.type]}</Badge>
              </div>
              <p className="text-xs font-medium line-clamp-1">{ex.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
