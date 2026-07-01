"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Type,
  List,
  ListOrdered,
  Languages,
  Lightbulb,
  Minus,
  ImageIcon,
  BookOpen,
  Eye,
  Bold,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createDefaultElement, getCatalogByCategory, CONTENT_BLOCK_CATALOG } from "@/lib/lesson-content/catalog";
import { deserializeHtmlToElements, serializeElementsToHtml } from "@/lib/lesson-content/html";
import type { CalloutVariant, ContentElement, ContentElementType } from "@/lib/lesson-content/types";

interface TextContentBuilderProps {
  blockId: string;
  html: string;
  onChange: (html: string) => void;
}

const TYPE_ICONS: Record<ContentElementType, React.ReactNode> = {
  heading: <Type className="size-3.5" />,
  paragraph: <Type className="size-3.5" />,
  "bullet-list": <List className="size-3.5" />,
  "numbered-list": <ListOrdered className="size-3.5" />,
  "phrase-pair": <Languages className="size-3.5" />,
  callout: <Lightbulb className="size-3.5" />,
  divider: <Minus className="size-3.5" />,
  image: <ImageIcon className="size-3.5" />,
  vocabulary: <BookOpen className="size-3.5" />,
};

function getTypeLabel(type: ContentElementType): string {
  return CONTENT_BLOCK_CATALOG.find((c) => c.type === type)?.label ?? type;
}

export function TextContentBuilder({ blockId, html, onChange }: TextContentBuilderProps) {
  const [elements, setElements] = useState<ContentElement[]>(() => deserializeHtmlToElements(html));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const catalogByCategory = useMemo(() => getCatalogByCategory(), []);
  const previewHtml = useMemo(() => serializeElementsToHtml(elements), [elements]);

  const commit = useCallback(
    (next: ContentElement[]) => {
      setElements(next);
      onChange(serializeElementsToHtml(next));
    },
    [onChange],
  );

  useEffect(() => {
    setElements(deserializeHtmlToElements(html));
    setEditingId(null);
  }, [blockId]);

  function updateElement(id: string, updater: (el: ContentElement) => ContentElement) {
    commit(elements.map((el) => (el.id === id ? updater(el) : el)));
  }

  function addElement(type: ContentElementType, afterId?: string) {
    const newEl = createDefaultElement(type);
    if (!afterId) {
      commit([...elements, newEl]);
    } else {
      const idx = elements.findIndex((e) => e.id === afterId);
      const next = [...elements.slice(0, idx + 1), newEl, ...elements.slice(idx + 1)];
      commit(next);
    }
    setEditingId(newEl.id);
    setAddOpen(false);
  }

  function removeElement(id: string) {
    const next = elements.filter((e) => e.id !== id);
    commit(next.length > 0 ? next : [createDefaultElement("paragraph")]);
  }

  function reorderElements(sourceId: string, targetId: string, position: "before" | "after") {
    const sourceIndex = elements.findIndex((e) => e.id === sourceId);
    const targetIndex = elements.findIndex((e) => e.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const next = [...elements];
    const [moved] = next.splice(sourceIndex, 1);
    let insertIndex = targetIndex;
    if (sourceIndex < targetIndex) insertIndex = targetIndex - 1;
    if (position === "after") insertIndex += 1;
    insertIndex = Math.max(0, Math.min(insertIndex, next.length));
    next.splice(insertIndex, 0, moved);
    commit(next);
  }

  function wrapBold(id: string, textareaId: string) {
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;
    const selected = current.slice(start, end) || "texto";
    const wrapped = `<strong>${selected}</strong>`;
    const newValue = current.slice(0, start) + wrapped + current.slice(end);
    updateElement(id, (item) => (item.type === "paragraph" ? { ...item, text: newValue } : item));
  }

  function renderElementEditor(el: ContentElement) {
    switch (el.type) {
      case "heading":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={el.level === 2 ? "default" : "outline"}
                onClick={() => updateElement(el.id, (e) => (e.type === "heading" ? { ...e, level: 2 } : e))}
              >
                Título grande
              </Button>
              <Button
                type="button"
                size="sm"
                variant={el.level === 3 ? "default" : "outline"}
                onClick={() => updateElement(el.id, (e) => (e.type === "heading" ? { ...e, level: 3 } : e))}
              >
                Subtítulo
              </Button>
            </div>
            <Input
              value={el.text}
              onChange={(e) => updateElement(el.id, (item) => (item.type === "heading" ? { ...item, text: e.target.value } : item))}
              placeholder="Digite o título..."
              className="font-semibold"
            />
          </div>
        );

      case "paragraph":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Use o botão para negrito em palavras-chave</Label>
              <Button type="button" size="sm" variant="ghost" onClick={() => wrapBold(el.id, `ta-${el.id}`)}>
                <Bold className="size-3.5 mr-1" /> Negrito
              </Button>
            </div>
            <Textarea
              id={`ta-${el.id}`}
              rows={3}
              value={el.text}
              onChange={(e) => updateElement(el.id, (item) => (item.type === "paragraph" ? { ...item, text: e.target.value } : item))}
              placeholder="Texto explicativo da aula..."
            />
          </div>
        );

      case "bullet-list":
      case "numbered-list":
        return (
          <div className="space-y-2">
            {el.items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-muted-foreground text-sm pt-2 w-5 shrink-0">{el.type === "numbered-list" ? `${idx + 1}.` : "•"}</span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const items = [...el.items];
                    items[idx] = e.target.value;
                    updateElement(el.id, (row) =>
                      row.type === el.type ? { ...row, items } : row,
                    );
                  }}
                  placeholder={`Item ${idx + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const items = el.items.filter((_, i) => i !== idx);
                    updateElement(el.id, (row) =>
                      row.type === el.type ? { ...row, items: items.length ? items : [""] } : row,
                    );
                  }}
                >
                  <Trash2 className="size-3.5 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateElement(el.id, (row) => (row.type === el.type ? { ...row, items: [...row.items, ""] } : row))}
            >
              <Plus className="size-3.5 mr-1" /> Adicionar item
            </Button>
          </div>
        );

      case "phrase-pair":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">🇮🇹 Italiano</Label>
              <Input
                value={el.italian}
                onChange={(e) => updateElement(el.id, (item) => (item.type === "phrase-pair" ? { ...item, italian: e.target.value } : item))}
                className="font-semibold"
                placeholder="Buongiorno!"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tradução (PT)</Label>
              <Input
                value={el.translation}
                onChange={(e) => updateElement(el.id, (item) => (item.type === "phrase-pair" ? { ...item, translation: e.target.value } : item))}
                placeholder="Bom dia!"
              />
            </div>
          </div>
        );

      case "callout":
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(["tip", "info", "warning"] as CalloutVariant[]).map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={el.variant === v ? "default" : "outline"}
                  onClick={() => updateElement(el.id, (item) => (item.type === "callout" ? { ...item, variant: v } : item))}
                >
                  {v === "tip" ? "💡 Dica" : v === "info" ? "ℹ️ Info" : "⚠️ Atenção"}
                </Button>
              ))}
            </div>
            <Input
              value={el.title}
              onChange={(e) => updateElement(el.id, (item) => (item.type === "callout" ? { ...item, title: e.target.value } : item))}
              placeholder="Título do destaque"
            />
            <Textarea
              rows={2}
              value={el.text}
              onChange={(e) => updateElement(el.id, (item) => (item.type === "callout" ? { ...item, text: e.target.value } : item))}
              placeholder="Conteúdo da dica ou aviso..."
            />
          </div>
        );

      case "divider":
        return <p className="text-sm text-muted-foreground italic">Linha separadora — sem conteúdo editável.</p>;

      case "image":
        return (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">URL da imagem</Label>
              <Input
                value={el.url}
                onChange={(e) => updateElement(el.id, (item) => (item.type === "image" ? { ...item, url: e.target.value } : item))}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Texto alternativo</Label>
                <Input
                  value={el.alt}
                  onChange={(e) => updateElement(el.id, (item) => (item.type === "image" ? { ...item, alt: e.target.value } : item))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Legenda (opcional)</Label>
                <Input
                  value={el.caption ?? ""}
                  onChange={(e) => updateElement(el.id, (item) => (item.type === "image" ? { ...item, caption: e.target.value } : item))}
                />
              </div>
            </div>
            {el.url && (
              <img src={el.url} alt={el.alt} className="max-h-32 rounded-lg object-cover border" />
            )}
          </div>
        );

      case "vocabulary":
        return (
          <div className="space-y-2">
            <Input
              value={el.title}
              onChange={(e) => updateElement(el.id, (item) => (item.type === "vocabulary" ? { ...item, title: e.target.value } : item))}
              placeholder="Título da tabela"
              className="font-medium"
            />
            {el.entries.map((entry, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] items-start p-2 rounded-lg bg-muted/40">
                <Input
                  value={entry.word}
                  onChange={(e) => {
                    const entries = [...el.entries];
                    entries[idx] = { ...entries[idx], word: e.target.value };
                    updateElement(el.id, (item) => (item.type === "vocabulary" ? { ...item, entries } : item));
                  }}
                  placeholder="Italiano"
                  className="font-semibold"
                />
                <Input
                  value={entry.translation}
                  onChange={(e) => {
                    const entries = [...el.entries];
                    entries[idx] = { ...entries[idx], translation: e.target.value };
                    updateElement(el.id, (item) => (item.type === "vocabulary" ? { ...item, entries } : item));
                  }}
                  placeholder="Tradução"
                />
                <Input
                  value={entry.note ?? ""}
                  onChange={(e) => {
                    const entries = [...el.entries];
                    entries[idx] = { ...entries[idx], note: e.target.value };
                    updateElement(el.id, (item) => (item.type === "vocabulary" ? { ...item, entries } : item));
                  }}
                  placeholder="Nota"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const entries = el.entries.filter((_, i) => i !== idx);
                    updateElement(el.id, (item) =>
                      item.type === "vocabulary" ? { ...item, entries: entries.length ? entries : [{ word: "", translation: "" }] } : item,
                    );
                  }}
                >
                  <Trash2 className="size-3.5 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateElement(el.id, (item) =>
                  item.type === "vocabulary" ? { ...item, entries: [...item.entries, { word: "", translation: "" }] } : item,
                )
              }
            >
              <Plus className="size-3.5 mr-1" /> Adicionar palavra
            </Button>
          </div>
        );
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Arraste os blocos para reordenar · Clique para editar · Sem HTML necessário
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
            <Eye className="size-3.5 mr-1" />
            {showPreview ? "Ocultar preview" : "Preview"}
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm">
                <Plus className="size-3.5 mr-1" /> Adicionar bloco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Biblioteca de conteúdo</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                <Tabs defaultValue={Object.keys(catalogByCategory)[0]}>
                  <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
                    {Object.keys(catalogByCategory).map((cat) => (
                      <TabsTrigger key={cat} value={cat} className="text-xs">
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(catalogByCategory).map(([cat, items]) => (
                    <TabsContent key={cat} value={cat} className="space-y-2 mt-0">
                      {items.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => addElement(item.type)}
                          className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <span>{item.emoji}</span>
                            {item.label}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 ml-6">{item.description}</p>
                        </button>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showPreview && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-primary mb-2">Como o aluno verá:</p>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </CardContent>
        </Card>
      )}

      <div
        className="min-h-[200px] space-y-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-3"
        onDragOver={(e) => e.preventDefault()}
      >
        {elements.map((el, index) => (
          <div
            key={el.id}
            draggable={editingId !== el.id}
            onDragStart={(e) => {
              if (editingId === el.id) {
                e.preventDefault();
                return;
              }
              setDraggedId(el.id);
              e.dataTransfer.setData("application/content-element-id", el.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
              setDropPosition(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedId && draggedId !== el.id) {
                const rect = e.currentTarget.getBoundingClientRect();
                const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
                setDragOverId(el.id);
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
              const sourceId = e.dataTransfer.getData("application/content-element-id");
              if (sourceId && sourceId !== el.id && dropPosition) {
                reorderElements(sourceId, el.id, dropPosition);
              }
              setDraggedId(null);
              setDragOverId(null);
              setDropPosition(null);
            }}
            onClick={() => setEditingId(el.id)}
            className={`
              group relative rounded-lg border bg-card p-3 transition-all cursor-pointer
              ${editingId === el.id ? "ring-2 ring-primary border-primary/50" : "hover:border-primary/30 hover:shadow-sm"}
              ${draggedId === el.id ? "opacity-50 scale-[0.98]" : ""}
              ${dragOverId === el.id && dropPosition === "before" ? "border-t-4 border-t-green-500" : ""}
              ${dragOverId === el.id && dropPosition === "after" ? "border-b-4 border-b-green-500" : ""}
            `}
          >
            <div className="flex items-start gap-2">
              <div
                className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="size-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    {TYPE_ICONS[el.type]}
                    {getTypeLabel(el.type)}
                    <span className="text-muted-foreground font-normal">#{index + 1}</span>
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(el.id);
                    }}
                  >
                    <Trash2 className="size-3.5 text-red-500" />
                  </Button>
                </div>

                {editingId === el.id ? (
                  <div onClick={(e) => e.stopPropagation()}>{renderElementEditor(el)}</div>
                ) : (
                  <div className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none pointer-events-none">
                    {el.type === "divider" ? (
                      <hr className="my-1" />
                    ) : el.type === "phrase-pair" ? (
                      <span>
                        <strong>{el.italian}</strong> — {el.translation}
                      </span>
                    ) : el.type === "heading" ? (
                      <span className="font-semibold text-foreground">{el.text}</span>
                    ) : el.type === "vocabulary" ? (
                      <span>{el.title} ({el.entries.length} palavras)</span>
                    ) : el.type === "image" ? (
                      <span>🖼️ {el.alt || el.url}</span>
                    ) : el.type === "callout" ? (
                      <span>💡 {el.title}</span>
                    ) : el.type === "bullet-list" || el.type === "numbered-list" ? (
                      <span>{el.items.length} itens</span>
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: el.text }} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {elements.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <Plus className="size-8 mx-auto mb-2 opacity-40" />
            Adicione blocos de conteúdo usando o botão acima
          </div>
        )}
      </div>
    </div>
  );
}
