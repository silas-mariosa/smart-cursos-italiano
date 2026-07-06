"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Columns, Component, GripVertical, Layers, Rows3 } from "lucide-react";
import type { PageDocument, SelectionTarget } from "@lms-mocks/page-builder-types";
import { getCatalogLabel } from "@/lib/page-builder/catalog";
import { moveComponentToTarget, normalizeColumn, reorderSections } from "@/lib/page-builder/document";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StructurePanelProps {
  document: PageDocument;
  selection: SelectionTarget;
  onSelect: (selection: SelectionTarget) => void;
  onChange: (doc: PageDocument) => void;
}

type DraggedItem =
  | { kind: "section"; sectionId: string }
  | { kind: "component"; sectionId: string; columnId: string; rowId: string; componentId: string };

type DropTarget =
  | { kind: "section"; sectionId: string; after: boolean }
  | { kind: "row"; sectionId: string; columnId: string; rowId: string }
  | { kind: "component"; sectionId: string; columnId: string; rowId: string; componentId: string; after: boolean };

function sectionKey(sectionId: string) {
  return `section:${sectionId}`;
}

function columnKey(sectionId: string, columnId: string) {
  return `column:${sectionId}:${columnId}`;
}

function rowKey(sectionId: string, columnId: string, rowId: string) {
  return `row:${sectionId}:${columnId}:${rowId}`;
}

export function StructurePanel({ document, selection, onSelect, onChange }: StructurePanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragged, setDragged] = useState<DraggedItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  useEffect(() => {
    if (!selection) return;
    setCollapsed((prev) => {
      const next = { ...prev };
      next[sectionKey(selection.sectionId)] = false;
      if ("columnId" in selection && selection.columnId) {
        next[columnKey(selection.sectionId, selection.columnId)] = false;
      }
      if ("rowId" in selection && selection.rowId && "columnId" in selection) {
        next[rowKey(selection.sectionId, selection.columnId, selection.rowId)] = false;
      }
      return next;
    });
  }, [selection]);

  function isOpen(key: string) {
    return collapsed[key] !== true;
  }

  function toggle(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function clearDrag() {
    setDragged(null);
    setDropTarget(null);
  }

  function isSelected(sel: NonNullable<SelectionTarget>) {
    if (!selection) return false;
    if (selection.kind !== sel.kind) return false;
    if (sel.kind === "section") return selection.kind === "section" && selection.sectionId === sel.sectionId;
    if (sel.kind === "column") {
      return selection.kind === "column" && selection.sectionId === sel.sectionId && selection.columnId === sel.columnId;
    }
    if (sel.kind === "row") {
      return (
        selection.kind === "row" &&
        selection.sectionId === sel.sectionId &&
        selection.columnId === sel.columnId &&
        selection.rowId === sel.rowId
      );
    }
    return (
      selection.kind === "component" &&
      selection.sectionId === sel.sectionId &&
      selection.columnId === sel.columnId &&
      selection.rowId === sel.rowId &&
      selection.componentId === sel.componentId
    );
  }

  function applySectionDrop(target: DropTarget & { kind: "section" }) {
    if (dragged?.kind !== "section" || dragged.sectionId === target.sectionId) return;
    onChange(reorderSections(document, dragged.sectionId, target.sectionId, target.after));
    clearDrag();
  }

  function applyComponentDrop(target: DropTarget) {
    if (dragged?.kind !== "component") return;

    const from = {
      sectionId: dragged.sectionId,
      columnId: dragged.columnId,
      rowId: dragged.rowId,
      componentId: dragged.componentId,
    };

    if (target.kind === "row") {
      onChange(
        moveComponentToTarget(document, from, {
          sectionId: target.sectionId,
          columnId: target.columnId,
          rowId: target.rowId,
        }),
      );
      onSelect({
        kind: "component",
        sectionId: target.sectionId,
        columnId: target.columnId,
        rowId: target.rowId,
        componentId: dragged.componentId,
      });
    } else if (target.kind === "component" && target.componentId !== dragged.componentId) {
      onChange(
        moveComponentToTarget(document, from, {
          sectionId: target.sectionId,
          columnId: target.columnId,
          rowId: target.rowId,
          targetComponentId: target.componentId,
          after: target.after,
        }),
      );
      onSelect({
        kind: "component",
        sectionId: target.sectionId,
        columnId: target.columnId,
        rowId: target.rowId,
        componentId: dragged.componentId,
      });
    } else {
      clearDrag();
      return;
    }

    clearDrag();
  }

  function TreeToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        className="shrink-0 p-0.5 rounded hover:bg-accent text-muted-foreground"
        aria-label={open ? "Recolher" : "Expandir"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-14rem)]">
      <div className="p-3 space-y-1 text-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <Layers className="size-3.5" /> Estrutura
        </p>
        <p className="text-[11px] text-muted-foreground mb-2">
          Arraste pelo ícone ⋮⋮ para mover. Use a seta para expandir ou recolher.
        </p>

        {document.sections.length === 0 && (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
            <p className="text-xs text-muted-foreground">Nenhuma seção na página.</p>
            <p className="text-[11px] text-muted-foreground mt-1">Adicione uma seção no canvas ou aplique um layout.</p>
          </div>
        )}

        {document.sections.map((section) => {
          const secKey = sectionKey(section.id);
          const secOpen = isOpen(secKey);
          const sectionDropBefore =
            dropTarget?.kind === "section" && dropTarget.sectionId === section.id && !dropTarget.after;
          const sectionDropAfter =
            dropTarget?.kind === "section" && dropTarget.sectionId === section.id && dropTarget.after;

          return (
            <div key={section.id}>
              <div
                className={cn(
                  "flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-accent group",
                  isSelected({ kind: "section", sectionId: section.id }) && "bg-primary/10 text-primary",
                  dragged?.kind === "section" && dragged.sectionId === section.id && "opacity-50",
                  sectionDropBefore && "border-t-2 border-t-green-500",
                  sectionDropAfter && "border-b-2 border-b-green-500",
                )}
                onDragOver={(e) => {
                  if (dragged?.kind !== "section") return;
                  e.preventDefault();
                  if (dragged.sectionId === section.id) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropTarget({
                    kind: "section",
                    sectionId: section.id,
                    after: e.clientY > rect.top + rect.height / 2,
                  });
                }}
                onDrop={(e) => {
                  if (dragged?.kind !== "section") return;
                  e.preventDefault();
                  const rect = e.currentTarget.getBoundingClientRect();
                  applySectionDrop({
                    kind: "section",
                    sectionId: section.id,
                    after: e.clientY > rect.top + rect.height / 2,
                  });
                }}
              >
                <TreeToggle open={secOpen} onToggle={() => toggle(secKey)} />
                <span
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDragged({ kind: "section", sectionId: section.id });
                  }}
                  onDragEnd={clearDrag}
                  className="cursor-grab opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground"
                  title="Arrastar seção"
                >
                  <GripVertical className="size-3" />
                </span>
                <button
                  type="button"
                  className="flex-1 flex items-center gap-1 px-1 py-0.5 rounded text-left text-xs min-w-0"
                  onClick={() => onSelect({ kind: "section", sectionId: section.id })}
                >
                  <Layers className="size-3 shrink-0" />
                  <span className="truncate font-medium">{section.label}</span>
                  <span className="text-muted-foreground ml-auto shrink-0">
                    {section.columnCount}
                    {section.columnCount > 1 && section.layoutDirection === "rows" ? "l" : "c"}
                  </span>
                </button>
              </div>

              {secOpen &&
                section.columns.map((col, ci) => {
                  const normalized = normalizeColumn(col);
                  const colKey = columnKey(section.id, col.id);
                  const colOpen = isOpen(colKey);

                  return (
                    <div key={col.id} className="ml-4">
                      <div
                        className={cn(
                          "flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-accent",
                          isSelected({ kind: "column", sectionId: section.id, columnId: col.id }) &&
                            "bg-primary/10 text-primary",
                        )}
                      >
                        <TreeToggle open={colOpen} onToggle={() => toggle(colKey)} />
                        <button
                          type="button"
                          className="flex-1 flex items-center gap-1 px-1 py-0.5 rounded text-left text-xs min-w-0"
                          onClick={() => onSelect({ kind: "column", sectionId: section.id, columnId: col.id })}
                        >
                          <Columns className="size-3 shrink-0" />
                          <span className="truncate">Coluna {ci + 1}</span>
                          <span className="text-muted-foreground ml-auto shrink-0">{normalized.rowCount}l</span>
                        </button>
                      </div>

                      {colOpen &&
                        normalized.rows.map((row, ri) => {
                          const rKey = rowKey(section.id, col.id, row.id);
                          const rowOpen = isOpen(rKey);
                          const rowDropActive =
                            dropTarget?.kind === "row" &&
                            dropTarget.sectionId === section.id &&
                            dropTarget.columnId === col.id &&
                            dropTarget.rowId === row.id;

                          return (
                            <div key={row.id} className="ml-4">
                              <div
                                className={cn(
                                  "flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-accent",
                                  isSelected({
                                    kind: "row",
                                    sectionId: section.id,
                                    columnId: col.id,
                                    rowId: row.id,
                                  }) && "bg-primary/10 text-primary",
                                  rowDropActive && "ring-1 ring-green-500 bg-green-500/10",
                                )}
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
                              >
                                <TreeToggle open={rowOpen} onToggle={() => toggle(rKey)} />
                                <button
                                  type="button"
                                  className="flex-1 flex items-center gap-1 px-1 py-0.5 rounded text-left text-xs min-w-0"
                                  onClick={() =>
                                    onSelect({ kind: "row", sectionId: section.id, columnId: col.id, rowId: row.id })
                                  }
                                >
                                  <Rows3 className="size-3 shrink-0" />
                                  <span className="truncate">Linha {ri + 1}</span>
                                  <span className="text-muted-foreground ml-auto shrink-0">{row.components.length}</span>
                                </button>
                              </div>

                              {rowOpen &&
                                row.components.map((comp) => {
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
                                      className={cn(
                                        "ml-4 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-accent group/comp",
                                        isSelected({
                                          kind: "component",
                                          sectionId: section.id,
                                          columnId: col.id,
                                          rowId: row.id,
                                          componentId: comp.id,
                                        }) && "bg-primary/10 text-primary font-medium",
                                        dragged?.kind === "component" &&
                                          dragged.componentId === comp.id &&
                                          "opacity-50",
                                        compDropBefore && "border-t-2 border-t-green-500",
                                        compDropAfter && "border-b-2 border-b-green-500",
                                      )}
                                      onDragOver={(e) => {
                                        if (dragged?.kind !== "component" || dragged.componentId === comp.id) return;
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setDropTarget({
                                          kind: "component",
                                          sectionId: section.id,
                                          columnId: col.id,
                                          rowId: row.id,
                                          componentId: comp.id,
                                          after: e.clientY > rect.top + rect.height / 2,
                                        });
                                      }}
                                      onDrop={(e) => {
                                        if (dragged?.kind !== "component" || dragged.componentId === comp.id) return;
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        applyComponentDrop({
                                          kind: "component",
                                          sectionId: section.id,
                                          columnId: col.id,
                                          rowId: row.id,
                                          componentId: comp.id,
                                          after: e.clientY > rect.top + rect.height / 2,
                                        });
                                      }}
                                    >
                                      <span
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          setDragged({
                                            kind: "component",
                                            sectionId: section.id,
                                            columnId: col.id,
                                            rowId: row.id,
                                            componentId: comp.id,
                                          });
                                        }}
                                        onDragEnd={clearDrag}
                                        className="cursor-grab opacity-0 group-hover/comp:opacity-100 shrink-0 text-muted-foreground"
                                        title="Arrastar componente"
                                      >
                                        <GripVertical className="size-3" />
                                      </span>
                                      <button
                                        type="button"
                                        className="flex-1 flex items-center gap-1 px-1 py-0.5 rounded text-left text-[11px] text-muted-foreground min-w-0"
                                        onClick={() =>
                                          onSelect({
                                            kind: "component",
                                            sectionId: section.id,
                                            columnId: col.id,
                                            rowId: row.id,
                                            componentId: comp.id,
                                          })
                                        }
                                      >
                                        <Component className="size-3 shrink-0" />
                                        <span className="truncate">{getCatalogLabel(comp.type)}</span>
                                      </button>
                                    </div>
                                  );
                                })}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
