"use client";

import { useState } from "react";
import type { Flashcard } from "@lms-mocks/practice-types";
import { GripVertical, Plus, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FlashcardsPanelProps {
  cards: Flashcard[];
  intro: string;
  onIntroChange: (intro: string) => void;
  onChange: (cards: Flashcard[]) => void;
}

function newCard(lessonId: string): Flashcard {
  return { id: `fc-${Date.now()}`, lessonId, front: "Parola", back: "Tradução", hint: "" };
}

export function FlashcardsPanel({ cards, intro, onIntroChange, onChange, lessonId }: FlashcardsPanelProps & { lessonId: string }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function updateCard(id: string, patch: Partial<Flashcard>) {
    onChange(cards.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCard(id: string) {
    onChange(cards.filter((c) => c.id !== id));
  }

  function reorder(sourceId: string, targetId: string) {
    const list = [...cards];
    const si = list.findIndex((c) => c.id === sourceId);
    const ti = list.findIndex((c) => c.id === targetId);
    if (si === -1 || ti === -1) return;
    const [moved] = list.splice(si, 1);
    list.splice(ti, 0, moved);
    onChange(list);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs">Introdução exibida ao aluno</Label>
        <Input value={intro} onChange={(e) => onIntroChange(e.target.value)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Flashcards ({cards.length})</h3>
          <p className="text-xs text-muted-foreground">Frente em italiano · Verso com tradução</p>
        </div>
        <Button type="button" size="sm" onClick={() => onChange([...cards, newCard(lessonId)])}>
          <Plus className="size-4 mr-1" /> Novo cartão
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            draggable
            onDragStart={() => setDraggedId(card.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId && draggedId !== card.id) reorder(draggedId, card.id);
            }}
            className={cn(
              "rounded-xl border bg-card overflow-hidden transition-all",
              draggedId === card.id && "opacity-50",
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
              <GripVertical className="size-3.5 text-muted-foreground cursor-grab" />
              <Badge variant="outline" className="text-[10px]">#{index + 1}</Badge>
              <button
                type="button"
                className="ml-auto text-xs text-primary flex items-center gap-1"
                onClick={() => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))}
              >
                <RotateCcw className="size-3" />
                {flipped[card.id] ? "Verso" : "Frente"}
              </button>
              <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeCard(card.id)}>
                <Trash2 className="size-3.5 text-red-500" />
              </Button>
            </div>

            <div
              className="p-4 min-h-[100px] flex items-center justify-center text-center cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10"
              onClick={() => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))}
            >
              <p className="font-semibold text-lg">{flipped[card.id] ? card.back : card.front}</p>
            </div>

            <div className="p-3 space-y-2 border-t">
              <div className="space-y-1">
                <Label className="text-[10px]">🇮🇹 Frente</Label>
                <Input className="h-8 text-sm font-medium" value={card.front} onChange={(e) => updateCard(card.id, { front: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Tradução</Label>
                <Input className="h-8 text-sm" value={card.back} onChange={(e) => updateCard(card.id, { back: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Dica (opcional)</Label>
                <Input className="h-8 text-xs" value={card.hint ?? ""} onChange={(e) => updateCard(card.id, { hint: e.target.value })} placeholder="Contexto ou mnemônico" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <p className="text-sm">Nenhum flashcard definido</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onChange([newCard(lessonId)])}>
            Criar primeiro cartão
          </Button>
        </div>
      )}
    </div>
  );
}
