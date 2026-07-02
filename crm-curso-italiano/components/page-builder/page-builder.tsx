"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Breakpoint, ComponentType, PageDocument, SelectionTarget } from "@lms-mocks/page-builder-types";
import { renderPageDocumentToHtml } from "@lms-mocks/page-builder-html";
import { usePageHistory } from "@/hooks/use-page-history";
import { PageBuilderToolbar } from "@/components/page-builder/toolbar";
import { LibraryPanel } from "@/components/page-builder/library-panel";
import { StructurePanel } from "@/components/page-builder/structure-panel";
import { PropertiesPanel } from "@/components/page-builder/properties-panel";
import { PageBuilderCanvas } from "@/components/page-builder/canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addComponent,
  appendLayout,
  insertComponent,
  normalizeDocument,
  replaceWithLayout,
  setColumnRowCount,
  setSectionColumnCount,
  updateColumn,
  updateComponent,
  updateSection,
} from "@/lib/page-builder/document";
import { createComponent, pbId } from "@/lib/page-builder/defaults";
import type { SavedLayout } from "@lms-mocks/page-builder-types";

interface PageBuilderProps {
  initialDocument: PageDocument;
  onSave: (doc: PageDocument, html: string) => void;
  previewHref?: string;
}

export function PageBuilder({ initialDocument, onSave, previewHref }: PageBuilderProps) {
  const { document, setDocument, undo, redo, canUndo, canRedo, reset } = usePageHistory(normalizeDocument(initialDocument));
  const [selection, setSelection] = useState<SelectionTarget>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);
  const documentRef = useRef(document);
  documentRef.current = document;

  useEffect(() => {
    const normalized = normalizeDocument(initialDocument);
    // Evita resetar seleção/histórico quando o pai reenvia o mesmo documento após auto-save.
    if (JSON.stringify(normalized) === JSON.stringify(normalizeDocument(documentRef.current))) {
      return;
    }
    reset(normalized);
    setSelection(null);
  }, [initialDocument, reset]);

  const persist = useCallback(
    (doc: PageDocument) => {
      const html = renderPageDocumentToHtml(doc);
      onSave(doc, html);
      setSaved(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaved(false), 2000);
    },
    [onSave],
  );

  const commit = useCallback(
    (doc: PageDocument) => {
      setDocument(doc);
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(doc), 600);
    },
    [setDocument, persist],
  );

  const activeSectionId = selection?.sectionId ?? document.sections[0]?.id ?? null;
  const activeColumnId =
    selection?.kind === "column" || selection?.kind === "row" || selection?.kind === "component"
      ? selection.columnId
      : document.sections.find((s) => s.id === activeSectionId)?.columns[0]?.id ?? null;
  const activeRowId = (() => {
    if (!activeSectionId || !activeColumnId) return null;
    const column = document.sections
      .find((s) => s.id === activeSectionId)
      ?.columns.find((c) => c.id === activeColumnId);
    if (!column) return null;
    if (selection?.kind === "row") return selection.rowId;
    if (selection?.kind === "component") return selection.rowId;
    return column.rows[0]?.id ?? null;
  })();

  function handleAddComponent(type: ComponentType) {
    if (!activeSectionId || !activeColumnId || !activeRowId) return;
    const next = addComponent(document, activeSectionId, activeColumnId, type, activeRowId);
    commit(next);
    const row = next.sections
      .find((s) => s.id === activeSectionId)
      ?.columns.find((c) => c.id === activeColumnId)
      ?.rows.find((r) => r.id === activeRowId);
    const added = row?.components[row.components.length - 1];
    if (added) {
      setSelection({
        kind: "component",
        sectionId: activeSectionId,
        columnId: activeColumnId,
        rowId: activeRowId,
        componentId: added.id,
      });
    }
  }

  function handleApplyLayout(sections: SavedLayout["sections"], mode: "append" | "replace") {
    const next = mode === "replace" ? replaceWithLayout(document, sections) : appendLayout(document, sections);
    commit(next);
  }

  function handleInsertReusable(reusableId: string) {
    if (!activeSectionId || !activeColumnId || !activeRowId) return;
    const block = document.reusableBlocks.find((b) => b.id === reusableId);
    if (!block) return;
    const comp = { ...block.component, id: pbId("cmp"), reusableId: block.linked ? block.id : undefined };
    commit(insertComponent(document, activeSectionId, activeColumnId, comp, activeRowId));
    setSelection({
      kind: "component",
      sectionId: activeSectionId,
      columnId: activeColumnId,
      rowId: activeRowId,
      componentId: comp.id,
    });
  }

  function handleUpdateSection(
    sectionId: string,
    patch: Partial<{ label: string; style: PageDocument["sections"][0]["style"]; columnCount: number; layoutDirection: "columns" | "rows" }>,
  ) {
    let next = document;
    if (patch.columnCount != null) next = setSectionColumnCount(next, sectionId, patch.columnCount);
    if (patch.label != null || patch.style != null || patch.layoutDirection != null) {
      next = updateSection(next, sectionId, {
        ...(patch.label != null ? { label: patch.label } : {}),
        ...(patch.style != null ? { style: patch.style } : {}),
        ...(patch.layoutDirection != null ? { layoutDirection: patch.layoutDirection } : {}),
      });
    }
    commit(next);
  }

  function handleUpdateColumn(sectionId: string, columnId: string, patch: { rowCount?: number; style?: PageDocument["sections"][0]["columns"][0]["style"] }) {
    let next = document;
    if (patch.rowCount != null) next = setColumnRowCount(next, sectionId, columnId, patch.rowCount);
    if (patch.style != null) {
      next = updateColumn(next, sectionId, columnId, { style: patch.style });
    }
    commit(next);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <PageBuilderToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        breakpoint={breakpoint}
        saved={saved}
        onUndo={undo}
        onRedo={redo}
        onBreakpoint={setBreakpoint}
        previewHref={previewHref}
      />

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 border-r shrink-0 flex flex-col bg-muted/10">
          <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-3 mt-2 grid grid-cols-2 h-8">
              <TabsTrigger value="library" className="text-xs">
                Biblioteca
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs">
                Estrutura
              </TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="flex-1 mt-0 overflow-hidden">
              <LibraryPanel
                document={document}
                activeSectionId={activeSectionId}
                activeColumnId={activeColumnId}
                onAddComponent={handleAddComponent}
                onApplyLayout={handleApplyLayout}
                onInsertReusable={handleInsertReusable}
              />
            </TabsContent>
            <TabsContent value="structure" className="flex-1 mt-0 overflow-hidden">
              <StructurePanel document={document} selection={selection} onSelect={setSelection} onChange={commit} />
            </TabsContent>
          </Tabs>
        </aside>

        <PageBuilderCanvas
          document={document}
          selection={selection}
          breakpoint={breakpoint}
          onSelect={setSelection}
          onChange={commit}
        />

        <aside className="w-72 border-l shrink-0 bg-muted/10 flex flex-col min-h-0">
          <div className="px-4 py-2 border-b">
            <p className="text-xs font-semibold">Propriedades</p>
          </div>
          <PropertiesPanel
            document={document}
            selection={selection}
            onUpdateDocument={commit}
            onUpdateComponent={(sectionId, columnId, rowId, componentId, patch) =>
              commit(updateComponent(document, sectionId, columnId, rowId, componentId, patch))
            }
            onUpdateSection={handleUpdateSection}
            onUpdateColumn={handleUpdateColumn}
          />
        </aside>
      </div>
    </div>
  );
}
