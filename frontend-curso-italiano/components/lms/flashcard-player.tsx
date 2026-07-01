"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { Flashcard } from "@lms-mocks/practice-types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function FlashcardPlayer({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        Nenhum flashcard disponível para esta aula.
      </div>
    );
  }

  const card = cards[index];
  const progress = Math.round((known.size / cards.length) * 100);

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  function markKnown() {
    setKnown((prev) => new Set(prev).add(card.id));
    next();
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Cartão {index + 1} de {cards.length}
        </span>
        <span>{known.size} dominados</span>
      </div>
      <Progress value={progress} />

      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className={cn(
          "w-full min-h-[220px] rounded-2xl border-2 flex flex-col items-center justify-center p-8 transition-all cursor-pointer select-none",
          flipped ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/50",
        )}
      >
        {!flipped ? (
          <>
            <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Italiano</p>
            <p className="text-3xl font-bold text-center">{card.front}</p>
            {card.hint && <p className="text-sm mt-4 opacity-70">{card.hint}</p>}
            <p className="text-xs mt-6 opacity-60">Toque para revelar</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Português</p>
            <p className="text-2xl font-semibold text-center">{card.back}</p>
          </>
        )}
      </button>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="icon" onClick={prev}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" onClick={() => setFlipped(false)}>
          <RotateCcw className="size-4 mr-2" />
          Virar
        </Button>
        <Button onClick={markKnown}>Sei ✓</Button>
        <Button variant="outline" size="icon" onClick={next}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
