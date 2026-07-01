"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  Video,
  FileText,
  File,
  Volume2,
  Link2,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import type { BlockType, LessonBlock } from "@lms-mocks/types";
import { TextContentBuilder } from "@/components/lms/text-content-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { serializeElementsToHtml } from "@/lib/lesson-content/html";
import { createDefaultElement } from "@/lib/lesson-content/catalog";

const LESSON_BLOCK_META: Record<
  Exclude<BlockType, "exercise">,
  { label: string; emoji: string; icon: React.ReactNode; description: string; color: string }
> = {
  video: {
    label: "Vídeo",
    emoji: "🎬",
    icon: <Video className="size-4" />,
    description: "YouTube ou embed de vídeo",
    color: "border-red-200 bg-red-50/50",
  },
  text: {
    label: "Conteúdo textual",
    emoji: "📝",
    icon: <FileText className="size-4" />,
    description: "Texto, listas, vocabulário — editor visual",
    color: "border-blue-200 bg-blue-50/50",
  },
  pdf: {
    label: "PDF",
    emoji: "📄",
    icon: <File className="size-4" />,
    description: "Material de apoio para download",
    color: "border-amber-200 bg-amber-50/50",
  },
  audio: {
    label: "Áudio",
    emoji: "🔊",
    icon: <Volume2 className="size-4" />,
    description: "Pronúncia ou podcast",
    color: "border-purple-200 bg-purple-50/50",
  },
  link: {
    label: "Link externo",
    emoji: "🔗",
    icon: <Link2 className="size-4" />,
    description: "Recurso complementar na web",
    color: "border-green-200 bg-green-50/50",
  },
};

type ContentBlockType = Exclude<BlockType, "exercise">;

interface LessonBlocksEditorProps {
  blocks: LessonBlock[];
  onChange: (blocks: LessonBlock[]) => void;
}

function createBlockContent(type: ContentBlockType): LessonBlock["content"] {
  switch (type) {
    case "video":
      return { url: "https://www.youtube.com/embed/0WPFwid_kEk", durationMinutes: 5 };
    case "text":
      return {
        html: serializeElementsToHtml([createDefaultElement("heading"), createDefaultElement("paragraph")]),
      };
    case "pdf":
      return { title: "Documento", filename: "documento.pdf" };
    case "audio":
      return { url: "", title: "Áudio da aula" };
    case "link":
      return { url: "https://", label: "Link externo" };
  }
}

export function LessonBlocksEditor({ blocks, onChange }: LessonBlocksEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(blocks.map((b) => b.id)));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addBlock(type: ContentBlockType) {
    const id = `block-${Date.now()}`;
    const newBlock: LessonBlock = {
      id,
      type,
      order: blocks.length + 1,
      content: createBlockContent(type),
    };
    onChange([...blocks, newBlock]);
    setExpandedIds((prev) => new Set([...prev, id]));
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function updateBlock(index: number, content: LessonBlock["content"]) {
    onChange(blocks.map((b, i) => (i === index ? { ...b, content } : b)));
  }

  function patchBlockContent(index: number, patch: Record<string, string | number>) {
    updateBlock(index, { ...(blocks[index].content as object), ...patch } as unknown as LessonBlock["content"]);
  }

  function reorderBlocks(sourceId: string, targetId: string, position: "before" | "after") {
    const sourceIndex = blocks.findIndex((b) => b.id === sourceId);
    const targetIndex = blocks.findIndex((b) => b.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const next = [...blocks];
    const [moved] = next.splice(sourceIndex, 1);
    let insertIndex = targetIndex;
    if (sourceIndex < targetIndex) insertIndex = targetIndex - 1;
    if (position === "after") insertIndex += 1;
    insertIndex = Math.max(0, Math.min(insertIndex, next.length));
    next.splice(insertIndex, 0, moved);
    onChange(next.map((b, i) => ({ ...b, order: i + 1 })));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((b, i) => ({ ...b, order: i + 1 })));
  }

  const previewHtml = blocks
    .map((block) => {
      const meta = LESSON_BLOCK_META[block.type as ContentBlockType];
      if (!meta) return "";
      if (block.type === "text") {
        return (block.content as { html: string }).html;
      }
      if (block.type === "video") {
        const c = block.content as { url: string };
        return `<div style="aspect-ratio:16/9;background:#000;border-radius:12px;margin:1rem 0;display:flex;align-items:center;justify-content:center;color:#fff">🎬 Vídeo: ${c.url}</div>`;
      }
      return `<p><em>[${meta.label}]</em></p>`;
    })
    .join("\n");

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
      {/* Sidebar — biblioteca de blocos */}
      <aside className="space-y-3 min-w-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Biblioteca de blocos</CardTitle>
            <p className="text-xs text-muted-foreground">Clique para adicionar à aula</p>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {(Object.entries(LESSON_BLOCK_META) as [ContentBlockType, (typeof LESSON_BLOCK_META)[ContentBlockType]][]).map(
              ([type, meta]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] ${meta.color}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {meta.icon}
                    <span>{meta.emoji} {meta.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{meta.description}</p>
                </button>
              ),
            )}
          </CardContent>
        </Card>

        <div className="hidden lg:block rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">💡 Dicas rápidas</p>
          <p>· Arraste blocos para reordenar</p>
          <p>· Blocos de texto usam editor visual</p>
          <p>· Sem necessidade de HTML</p>
        </div>
      </aside>

      {/* Canvas principal */}
      <div className="space-y-4 min-w-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Conteúdo da aula</h2>
            <p className="text-xs text-muted-foreground">{blocks.length} bloco{blocks.length !== 1 ? "s" : ""}</p>
          </div>
          {blocks.length > 0 && (
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="size-3.5 mr-1" /> Preview completo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Pré-visualização do conteúdo</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                  <div className="prose prose-sm max-w-none p-2" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div
          className="min-h-[calc(100vh-16rem)] w-full space-y-3 rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 bg-muted/10"
          onDragOver={(e) => e.preventDefault()}
        >
          {blocks.map((block, index) => {
            const meta = LESSON_BLOCK_META[block.type as ContentBlockType];
            if (!meta) return null;
            const isExpanded = expandedIds.has(block.id);

            return (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => {
                  setDraggedId(block.id);
                  e.dataTransfer.setData("application/lesson-block-id", block.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                  setDropPosition(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedId && draggedId !== block.id) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
                    setDragOverId(block.id);
                    setDropPosition(position);
                  }
                }}
                onDragLeave={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const { clientX, clientY } = e;
                  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
                    setDragOverId(null);
                    setDropPosition(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData("application/lesson-block-id");
                  if (sourceId && sourceId !== block.id && dropPosition) {
                    reorderBlocks(sourceId, block.id, dropPosition);
                  }
                  setDraggedId(null);
                  setDragOverId(null);
                  setDropPosition(null);
                }}
                className={`
                  rounded-xl border bg-card shadow-sm transition-all
                  ${meta.color}
                  ${draggedId === block.id ? "opacity-50 scale-[0.99]" : ""}
                  ${dragOverId === block.id && dropPosition === "before" ? "border-t-4 border-t-green-500" : ""}
                  ${dragOverId === block.id && dropPosition === "after" ? "border-b-4 border-b-green-500" : ""}
                `}
              >
                <div className="flex items-center gap-2 p-3 border-b bg-card/80 rounded-t-xl">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </div>
                  <button
                    type="button"
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                    onClick={() => toggleExpand(block.id)}
                  >
                    {meta.icon}
                    <span className="font-medium text-sm truncate">
                      Bloco {index + 1} — {meta.label}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {block.type}
                    </Badge>
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveBlock(index, -1)} disabled={index === 0}>
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}>
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleExpand(block.id)}>
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeBlock(index)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4 bg-card rounded-b-xl">
                    {block.type === "video" && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label>URL do vídeo (YouTube embed)</Label>
                          <Input
                            value={(block.content as { url: string }).url}
                            onChange={(e) => patchBlockContent(index, { url: e.target.value })}
                            placeholder="https://www.youtube.com/embed/..."
                          />
                        </div>
                        <div className="space-y-1 max-w-[200px]">
                          <Label>Duração (min)</Label>
                          <Input
                            type="number"
                            min={1}
                            value={(block.content as { durationMinutes: number }).durationMinutes}
                            onChange={(e) => patchBlockContent(index, { durationMinutes: Number(e.target.value) || 1 })}
                          />
                        </div>
                        {(block.content as { url: string }).url && (
                          <div className="aspect-video w-full rounded-lg overflow-hidden border bg-black">
                            <iframe
                              src={(block.content as { url: string }).url}
                              title="Preview vídeo"
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === "text" && (
                      <TextContentBuilder
                        blockId={block.id}
                        html={(block.content as { html: string }).html}
                        onChange={(html) => updateBlock(index, { html })}
                      />
                    )}

                    {block.type === "pdf" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Título do documento</Label>
                          <Input
                            value={(block.content as { title: string }).title}
                            onChange={(e) => patchBlockContent(index, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Nome do arquivo</Label>
                          <Input
                            value={(block.content as { filename: string }).filename}
                            onChange={(e) => patchBlockContent(index, { filename: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {block.type === "audio" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Título</Label>
                          <Input
                            value={(block.content as { title: string }).title}
                            onChange={(e) => patchBlockContent(index, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>URL do áudio</Label>
                          <Input
                            value={(block.content as { url: string }).url}
                            onChange={(e) => patchBlockContent(index, { url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}

                    {block.type === "link" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>URL</Label>
                          <Input
                            value={(block.content as { url: string }).url}
                            onChange={(e) => patchBlockContent(index, { url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Texto do botão</Label>
                          <Input
                            value={(block.content as { label: string }).label}
                            onChange={(e) => patchBlockContent(index, { label: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {blocks.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <Plus className="size-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum bloco ainda</p>
              <p className="text-sm mt-1">Use a biblioteca ao lado para montar o conteúdo da aula</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
