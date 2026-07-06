"use client";

import { useEffect, useState } from "react";
import { FileText, LayoutTemplate } from "lucide-react";
import { getNewLessonLayoutOptions } from "@/lib/page-builder/lesson-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type NewLessonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle?: string;
  onConfirm: (title: string, layoutId: string | null) => void;
};

export function NewLessonDialog({
  open,
  onOpenChange,
  moduleTitle,
  onConfirm,
}: NewLessonDialogProps) {
  const [title, setTitle] = useState("");
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const layouts = getNewLessonLayoutOptions();

  useEffect(() => {
    if (!open) {
      setTitle("");
      setLayoutId(null);
    }
  }, [open]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onConfirm(trimmed, layoutId);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova aula</DialogTitle>
            {moduleTitle && (
              <p className="text-sm text-muted-foreground">
                Módulo: <span className="font-medium text-foreground">{moduleTitle}</span>
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Nome da aula</Label>
              <Input
                id="lesson-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Saudações essenciais"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Modelo de página</Label>
              <p className="text-xs text-muted-foreground">
                Escolha um layout pronto ou comece em branco. Você pode editar tudo depois no Page Builder.
              </p>
              <ScrollArea className="h-64 rounded-lg border p-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setLayoutId(null)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors hover:border-primary/50",
                      layoutId === null && "border-primary bg-primary/5 ring-1 ring-primary",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Em branco</p>
                        <p className="text-xs text-muted-foreground">Sem conteúdo inicial</p>
                      </div>
                    </div>
                  </button>

                  {layouts.map((layout) => {
                    const selected = layoutId === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => setLayoutId(layout.id)}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-colors hover:border-primary/50",
                          selected && "border-primary bg-primary/5 ring-1 ring-primary",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <LayoutTemplate className="mt-0.5 size-4 shrink-0 text-primary" />
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium leading-snug">{layout.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {layout.description}
                            </p>
                            <Badge variant="secondary" className="text-[10px]">
                              {layout.category}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Criar aula
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
