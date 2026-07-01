"use client";

import { useState } from "react";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import type { PageDocument, SelectionTarget } from "@lms-mocks/page-builder-types";
import { ComponentPreview, SectionPreviewStyle } from "@/components/page-builder/component-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addSection,
  duplicateComponent,
  duplicateSection,
  removeComponent,
  removeSection,
  reorderComponentInColumn,
  reorderSections,
} from "@/lib/page-builder/document";

interface PageBuilderCanvasProps {
  document: PageDocument;
  selection: SelectionTarget;
  breakpoint: "desktop" | "tablet" | "mobile";
  onSelect: (sel: SelectionTarget) => void;
  onChange: (doc: PageDocument) => void;
}

const BREAKPOINT_WIDTH = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function PageBuilderCanvas({ document, selection, breakpoint, onSelect, onChange }: PageBuilderCanvasProps) {
  const [dragged, setDragged] = useState<{ kind: "section" | "component"; id: string; sectionId?: string; columnId?: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);

  return (
    <div className="flex-1 overflow-auto bg-muted/20 p-6 flex justify-center min-h-0">
      <div
        className="transition-all duration-300 w-full"
        style={{ maxWidth: BREAKPOINT_WIDTH[breakpoint] }}
      >
        <div className="space-y-4">
          {document.sections.map((section) => {
            const sectionSelected = selection?.kind === "section" && selection.sectionId === section.id;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDragged({ kind: "section", id: section.id })}
                onDragEnd={() => {
                  setDragged(null);
                  setDropTarget(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragged?.kind === "section" && dragged.id !== section.id) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropTarget({ id: section.id, after: e.clientY > rect.top + rect.height / 2 });
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragged?.kind === "section" && dropTarget) {
                    onChange(reorderSections(document, dragged.id, dropTarget.id, dropTarget.after));
                  }
                  setDragged(null);
                  setDropTarget(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({ kind: "section", sectionId: section.id });
                }}
                className={cn(
                  "group relative rounded-xl border-2 bg-background transition-all",
                  sectionSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/30",
                  dragged?.id === section.id && "opacity-50",
                  dropTarget?.id === section.id && !dropTarget.after && "border-t-4 border-t-green-500",
                  dropTarget?.id === section.id && dropTarget.after && "border-b-4 border-b-green-500",
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/40 rounded-t-xl">
                  <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                  <span className="text-xs font-semibold flex-1">{section.label}</span>
                  <span className="text-[10px] text-muted-foreground">{section.columnCount} col</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(duplicateSection(document, section.id));
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (document.sections.length > 1) onChange(removeSection(document, section.id));
                      }}
                    >
                      <Trash2 className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>

                <SectionPreviewStyle style={section.style}>
                  <div
                    className={cn(
                      "p-4 gap-4",
                      section.columnCount > 1 ? "grid" : "block",
                    )}
                    style={{
                      gridTemplateColumns: section.columnCount > 1 ? `repeat(${section.columnCount}, minmax(0, 1fr))` : undefined,
                      gap: section.style?.gap ?? 16,
                    }}
                  >
                    {section.columns.map((col) => {
                      const colSelected = selection?.kind === "column" && selection.columnId === col.id;
                      return (
                        <div
                          key={col.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({ kind: "column", sectionId: section.id, columnId: col.id });
                          }}
                          className={cn(
                            "min-h-[80px] rounded-lg border border-dashed p-3 transition-colors",
                            colSelected ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/40",
                          )}
                        >
                          <div className="space-y-3">
                            {col.components.map((comp) => {
                              const compSelected =
                                selection?.kind === "component" && selection.componentId === comp.id;
                              return (
                                <div
                                  key={comp.id}
                                  draggable
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    setDragged({ kind: "component", id: comp.id, sectionId: section.id, columnId: col.id });
                                  }}
                                  onDragEnd={() => {
                                    setDragged(null);
                                    setDropTarget(null);
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (dragged?.kind === "component" && dragged.id !== comp.id) {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setDropTarget({ id: comp.id, after: e.clientY > rect.top + rect.height / 2 });
                                    }
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (dragged?.kind === "component" && dragged.sectionId && dragged.columnId && dropTarget) {
                                      onChange(
                                        reorderComponentInColumn(
                                          document,
                                          dragged.sectionId,
                                          dragged.columnId,
                                          dragged.id,
                                          dropTarget.id,
                                          dropTarget.after,
                                        ),
                                      );
                                    }
                                    setDragged(null);
                                    setDropTarget(null);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      kind: "component",
                                      sectionId: section.id,
                                      columnId: col.id,
                                      componentId: comp.id,
                                    });
                                  }}
                                  className={cn(
                                    "group/comp relative rounded-lg border p-2 cursor-pointer transition-all",
                                    compSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-transparent hover:border-muted-foreground/30 hover:shadow-sm",
                                    dragged?.id === comp.id && "opacity-50",
                                    dropTarget?.id === comp.id && !dropTarget.after && "border-t-2 border-t-green-500",
                                    dropTarget?.id === comp.id && dropTarget.after && "border-b-2 border-b-green-500",
                                  )}
                                >
                                  <div className="absolute -left-1 top-2 opacity-0 group-hover/comp:opacity-100">
                                    <GripVertical className="size-3 text-muted-foreground" />
                                  </div>
                                  <div className="absolute -right-1 -top-1 opacity-0 group-hover/comp:opacity-100 flex gap-0.5 bg-background border rounded shadow-sm">
                                    <button
                                      type="button"
                                      className="p-1 hover:bg-accent rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(duplicateComponent(document, section.id, col.id, comp.id));
                                      }}
                                    >
                                      <Copy className="size-3" />
                                    </button>
                                    <button
                                      type="button"
                                      className="p-1 hover:bg-accent rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(removeComponent(document, section.id, col.id, comp.id));
                                      }}
                                    >
                                      <Trash2 className="size-3 text-red-500" />
                                    </button>
                                  </div>
                                  <ComponentPreview component={comp} />
                                </div>
                              );
                            })}
                            {col.components.length === 0 && (
                              <p className="text-xs text-center text-muted-foreground py-4">Arraste ou adicione blocos</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionPreviewStyle>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => onChange(addSection(document))}
          >
            <Plus className="size-4 mr-1" /> Nova seção
          </Button>
        </div>
      </div>
    </div>
  );
}
