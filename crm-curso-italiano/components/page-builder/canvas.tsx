"use client";

import { useState } from "react";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import type { ComponentType, PageDocument, SelectionTarget } from "@lms-mocks/page-builder-types";
import { ComponentPreview, SectionPreviewStyle } from "@/components/page-builder/component-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCatalogLabel } from "@/lib/page-builder/catalog";
import { cn } from "@/lib/utils";
import {
  addSection,
  duplicateComponent,
  duplicateSection,
  moveComponentToTarget,
  normalizeColumn,
  removeComponent,
  removeSection,
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

type DeleteTarget =
  | {
      kind: "component";
      sectionId: string;
      columnId: string;
      rowId: string;
      componentId: string;
      componentType: ComponentType;
    }
  | { kind: "section"; sectionId: string; label: string };

type DraggedItem =
  | { kind: "section"; id: string }
  | { kind: "component"; id: string; sectionId: string; columnId: string; rowId: string };

type DropTarget =
  | { kind: "section"; id: string; after: boolean }
  | { kind: "row"; sectionId: string; columnId: string; rowId: string }
  | { kind: "component"; sectionId: string; columnId: string; rowId: string; componentId: string; after: boolean };

export function PageBuilderCanvas({ document, selection, breakpoint, onSelect, onChange }: PageBuilderCanvasProps) {
  const [dragged, setDragged] = useState<DraggedItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  function clearDragState() {
    setDragged(null);
    setDropTarget(null);
  }

  function applyComponentDrop(target: DropTarget) {
    if (dragged?.kind !== "component") return;

    const from = {
      sectionId: dragged.sectionId,
      columnId: dragged.columnId,
      rowId: dragged.rowId,
      componentId: dragged.id,
    };

    let next = document;
    let targetSelection: SelectionTarget = null;

    if (target.kind === "row") {
      next = moveComponentToTarget(document, from, {
        sectionId: target.sectionId,
        columnId: target.columnId,
        rowId: target.rowId,
      });
      targetSelection = {
        kind: "component",
        sectionId: target.sectionId,
        columnId: target.columnId,
        rowId: target.rowId,
        componentId: dragged.id,
      };
    } else if (target.kind === "component" && target.componentId !== dragged.id) {
      next = moveComponentToTarget(document, from, {
        sectionId: target.sectionId,
        columnId: target.columnId,
        rowId: target.rowId,
        targetComponentId: target.componentId,
        after: target.after,
      });
      targetSelection = {
        kind: "component",
        sectionId: target.sectionId,
        columnId: target.columnId,
        rowId: target.rowId,
        componentId: dragged.id,
      };
    } else {
      clearDragState();
      return;
    }

    onChange(next);
    if (targetSelection) onSelect(targetSelection);
    clearDragState();
  }

  function isRowDropTarget(sectionId: string, columnId: string, rowId: string) {
    return (
      dropTarget?.kind === "row" &&
      dropTarget.sectionId === sectionId &&
      dropTarget.columnId === columnId &&
      dropTarget.rowId === rowId
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.kind === "component") {
      const { sectionId, columnId, rowId, componentId } = deleteTarget;
      onChange(removeComponent(document, sectionId, columnId, rowId, componentId));
      if (selection?.kind === "component" && selection.componentId === componentId) {
        onSelect(null);
      }
    } else if (document.sections.length > 1) {
      onChange(removeSection(document, deleteTarget.sectionId));
      if (selection?.sectionId === deleteTarget.sectionId) {
        onSelect(null);
      }
    }

    setDeleteTarget(null);
  }

  const deleteTitle =
    deleteTarget?.kind === "component"
      ? `Excluir ${getCatalogLabel(deleteTarget.componentType).toLowerCase()}?`
      : "Excluir seção?";

  const deleteDescription =
    deleteTarget?.kind === "component"
      ? "Este bloco será removido da página. Essa ação pode ser desfeita com Ctrl+Z."
      : `A seção "${deleteTarget?.kind === "section" ? deleteTarget.label : ""}" e todo o conteúdo dentro dela serão removidos. Essa ação pode ser desfeita com Ctrl+Z.`;

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
                onDragEnd={clearDragState}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragged?.kind === "section" && dragged.id !== section.id) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropTarget({ kind: "section", id: section.id, after: e.clientY > rect.top + rect.height / 2 });
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragged?.kind === "section" && dropTarget?.kind === "section") {
                    onChange(reorderSections(document, dragged.id, dropTarget.id, dropTarget.after));
                  }
                  clearDragState();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({ kind: "section", sectionId: section.id });
                }}
                className={cn(
                  "group relative rounded-xl border-2 bg-background transition-all",
                  sectionSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/30",
                  dragged?.kind === "section" && dragged.id === section.id && "opacity-50",
                  dropTarget?.kind === "section" &&
                    dropTarget.id === section.id &&
                    !dropTarget.after &&
                    "border-t-4 border-t-green-500",
                  dropTarget?.kind === "section" &&
                    dropTarget.id === section.id &&
                    dropTarget.after &&
                    "border-b-4 border-b-green-500",
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/40 rounded-t-xl">
                  <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                  <span className="text-xs font-semibold flex-1">{section.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {section.columnCount > 1
                      ? section.layoutDirection === "rows"
                        ? `${section.columnCount} lin`
                        : `${section.columnCount} col`
                      : "1 col"}
                  </span>
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
                        if (document.sections.length > 1) {
                          setDeleteTarget({ kind: "section", sectionId: section.id, label: section.label });
                        }
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
                      section.columnCount > 1
                        ? section.layoutDirection === "rows"
                          ? "flex flex-col"
                          : "grid"
                        : "block",
                    )}
                    style={{
                      gridTemplateColumns:
                        section.columnCount > 1 && section.layoutDirection !== "rows"
                          ? `repeat(${section.columnCount}, minmax(0, 1fr))`
                          : undefined,
                      gap: section.style?.gap ?? 16,
                    }}
                  >
                    {section.columns.map((col) => {
                      const normalizedCol = normalizeColumn(col);
                      const colSelected = selection?.kind === "column" && selection.columnId === col.id;
                      return (
                        <div
                          key={col.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({ kind: "column", sectionId: section.id, columnId: col.id });
                          }}
                          className={cn(
                            "min-h-[80px] rounded-lg border border-dashed p-2 transition-colors space-y-2",
                            colSelected ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/40",
                          )}
                        >
                          {normalizedCol.rows.map((row, rowIndex) => {
                            const rowSelected = selection?.kind === "row" && selection.rowId === row.id;
                            const rowDropActive = isRowDropTarget(section.id, col.id, row.id);
                            return (
                              <div
                                key={row.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect({ kind: "row", sectionId: section.id, columnId: col.id, rowId: row.id });
                                }}
                                onDragOver={(e) => {
                                  if (dragged?.kind !== "component") return;
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDropTarget({
                                    kind: "row",
                                    sectionId: section.id,
                                    columnId: col.id,
                                    rowId: row.id,
                                  });
                                }}
                                onDrop={(e) => {
                                  if (dragged?.kind !== "component") return;
                                  e.preventDefault();
                                  e.stopPropagation();
                                  applyComponentDrop({
                                    kind: "row",
                                    sectionId: section.id,
                                    columnId: col.id,
                                    rowId: row.id,
                                  });
                                }}
                                className={cn(
                                  "min-h-[56px] rounded-md border border-dashed p-2 transition-colors",
                                  rowSelected
                                    ? "border-primary/70 bg-primary/5"
                                    : rowDropActive
                                      ? "border-green-500 bg-green-500/10"
                                      : "border-muted-foreground/15 hover:border-primary/30 bg-background/50",
                                )}
                              >
                                <p className="text-[10px] font-medium text-muted-foreground mb-2">
                                  Linha {rowIndex + 1}
                                </p>
                                <div className="space-y-3">
                                  {row.components.map((comp) => {
                                    const compSelected =
                                      selection?.kind === "component" && selection.componentId === comp.id;
                                    const compDropBefore =
                                      dropTarget?.kind === "component" &&
                                      dropTarget.componentId === comp.id &&
                                      !dropTarget.after;
                                    const compDropAfter =
                                      dropTarget?.kind === "component" &&
                                      dropTarget.componentId === comp.id &&
                                      dropTarget.after;
                                    return (
                                      <div
                                        key={comp.id}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          setDragged({
                                            kind: "component",
                                            id: comp.id,
                                            sectionId: section.id,
                                            columnId: col.id,
                                            rowId: row.id,
                                          });
                                        }}
                                        onDragEnd={clearDragState}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (dragged?.kind === "component" && dragged.id !== comp.id) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setDropTarget({
                                              kind: "component",
                                              sectionId: section.id,
                                              columnId: col.id,
                                              rowId: row.id,
                                              componentId: comp.id,
                                              after: e.clientY > rect.top + rect.height / 2,
                                            });
                                          }
                                        }}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (dragged?.kind !== "component" || dragged.id === comp.id) return;
                                          const after = dropTarget?.kind === "component" && dropTarget.componentId === comp.id
                                            ? dropTarget.after
                                            : e.clientY > e.currentTarget.getBoundingClientRect().top + e.currentTarget.getBoundingClientRect().height / 2;
                                          applyComponentDrop({
                                            kind: "component",
                                            sectionId: section.id,
                                            columnId: col.id,
                                            rowId: row.id,
                                            componentId: comp.id,
                                            after,
                                          });
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelect({
                                            kind: "component",
                                            sectionId: section.id,
                                            columnId: col.id,
                                            rowId: row.id,
                                            componentId: comp.id,
                                          });
                                        }}
                                        className={cn(
                                          "group/comp relative rounded-lg border p-2 cursor-pointer transition-all",
                                          compSelected
                                            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                            : "border-transparent hover:border-muted-foreground/30 hover:shadow-sm",
                                          dragged?.kind === "component" && dragged.id === comp.id && "opacity-50",
                                          compDropBefore && "border-t-2 border-t-green-500",
                                          compDropAfter && "border-b-2 border-b-green-500",
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
                                              onChange(duplicateComponent(document, section.id, col.id, row.id, comp.id));
                                            }}
                                          >
                                            <Copy className="size-3" />
                                          </button>
                                          <button
                                            type="button"
                                            className="p-1 hover:bg-accent rounded"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteTarget({
                                                kind: "component",
                                                sectionId: section.id,
                                                columnId: col.id,
                                                rowId: row.id,
                                                componentId: comp.id,
                                                componentType: comp.type,
                                              });
                                            }}
                                          >
                                            <Trash2 className="size-3 text-red-500" />
                                          </button>
                                        </div>
                                        <ComponentPreview component={comp} />
                                      </div>
                                    );
                                  })}
                                  {row.components.length === 0 && (
                                    <p
                                      className={cn(
                                        "text-xs text-center text-muted-foreground py-2 rounded border border-dashed border-transparent",
                                        rowDropActive && "border-green-500 text-green-700 bg-green-500/5",
                                      )}
                                    >
                                      {dragged?.kind === "component" ? "Solte o bloco aqui" : "Clique aqui e adicione blocos nesta linha"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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

      <Dialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteTitle}</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
