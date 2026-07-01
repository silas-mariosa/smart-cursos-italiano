"use client";

import { ChevronDown, ChevronRight, Columns, Component, Layers } from "lucide-react";
import type { PageDocument, SelectionTarget } from "@lms-mocks/page-builder-types";
import { getCatalogLabel } from "@/lib/page-builder/catalog";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface StructurePanelProps {
  document: PageDocument;
  selection: SelectionTarget;
  onSelect: (selection: SelectionTarget) => void;
}

export function StructurePanel({ document, selection, onSelect }: StructurePanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function isSelected(sel: NonNullable<SelectionTarget>) {
    if (!selection) return false;
    if (selection.kind !== sel.kind) return false;
    if (sel.kind === "section") return selection.kind === "section" && selection.sectionId === sel.sectionId;
    if (sel.kind === "column")
      return selection.kind === "column" && selection.sectionId === sel.sectionId && selection.columnId === sel.columnId;
    return (
      selection.kind === "component" &&
      selection.sectionId === sel.sectionId &&
      selection.columnId === sel.columnId &&
      selection.componentId === sel.componentId
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-14rem)]">
      <div className="p-3 space-y-1 text-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
          <Layers className="size-3.5" /> Estrutura
        </p>
        {document.sections.map((section) => {
          const secOpen = !collapsed[section.id];
          return (
            <div key={section.id}>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-1 px-2 py-1.5 rounded text-left text-xs hover:bg-accent",
                  isSelected({ kind: "section", sectionId: section.id }) && "bg-primary/10 text-primary font-medium",
                )}
                onClick={() => onSelect({ kind: "section", sectionId: section.id })}
              >
                {secOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                <Layers className="size-3 shrink-0" />
                <span className="truncate">{section.label}</span>
                <span className="text-muted-foreground ml-auto">{section.columnCount}c</span>
              </button>
              {secOpen &&
                section.columns.map((col, ci) => (
                  <div key={col.id} className="ml-4">
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-1 px-2 py-1 rounded text-left text-xs hover:bg-accent",
                        isSelected({ kind: "column", sectionId: section.id, columnId: col.id }) && "bg-primary/10 text-primary",
                      )}
                      onClick={() => onSelect({ kind: "column", sectionId: section.id, columnId: col.id })}
                    >
                      <Columns className="size-3" />
                      Coluna {ci + 1}
                      <span className="text-muted-foreground ml-auto">{col.components.length}</span>
                    </button>
                    {col.components.map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        className={cn(
                          "w-full flex items-center gap-1 px-2 py-1 ml-4 rounded text-left text-[11px] hover:bg-accent text-muted-foreground",
                          isSelected({
                            kind: "component",
                            sectionId: section.id,
                            columnId: col.id,
                            componentId: comp.id,
                          }) && "bg-primary/10 text-primary font-medium",
                        )}
                        onClick={() =>
                          onSelect({
                            kind: "component",
                            sectionId: section.id,
                            columnId: col.id,
                            componentId: comp.id,
                          })
                        }
                      >
                        <Component className="size-3" />
                        {getCatalogLabel(comp.type)}
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
