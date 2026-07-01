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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addComponent,
  appendLayout,
  insertComponent,
  replaceWithLayout,
  setSectionColumnCount,
  updateComponent,
  updateSection,
} from "@/lib/page-builder/document";
import { createComponent, pbId } from "@/lib/page-builder/defaults";
import type { SavedLayout } from "@lms-mocks/page-builder-types";

interface PageBuilderProps {
  initialDocument: PageDocument;
  onSave: (doc: PageDocument, html: string) => void;
}

export function PageBuilder({ initialDocument, onSave }: PageBuilderProps) {
  const { document, setDocument, undo, redo, canUndo, canRedo, reset } = usePageHistory(initialDocument);
  const [selection, setSelection] = useState<SelectionTarget>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    reset(initialDocument);
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
    selection?.kind === "column" || selection?.kind === "component"
      ? selection.columnId
      : document.sections.find((s) => s.id === activeSectionId)?.columns[0]?.id ?? null;

  function handleAddComponent(type: ComponentType) {
    if (!activeSectionId || !activeColumnId) return;
    const next = addComponent(document, activeSectionId, activeColumnId, type);
    commit(next);
    const col = next.sections.find((s) => s.id === activeSectionId)?.columns.find((c) => c.id === activeColumnId);
    const added = col?.components[col.components.length - 1];
    if (added) {
      setSelection({
        kind: "component",
        sectionId: activeSectionId,
        columnId: activeColumnId,
        componentId: added.id,
      });
    }
  }

  function handleApplyLayout(sections: SavedLayout["sections"], mode: "append" | "replace") {
    const next = mode === "replace" ? replaceWithLayout(document, sections) : appendLayout(document, sections);
    commit(next);
  }

  function handleInsertReusable(reusableId: string) {
    if (!activeSectionId || !activeColumnId) return;
    const block = document.reusableBlocks.find((b) => b.id === reusableId);
    if (!block) return;
    const comp = { ...block.component, id: pbId("cmp"), reusableId: block.linked ? block.id : undefined };
    commit(insertComponent(document, activeSectionId, activeColumnId, comp));
    setSelection({
      kind: "component",
      sectionId: activeSectionId,
      columnId: activeColumnId,
      componentId: comp.id,
    });
  }

  function handleUpdateSection(
    sectionId: string,
    patch: Partial<{ label: string; style: PageDocument["sections"][0]["style"]; columnCount: number }>,
  ) {
    let next = document;
    if (patch.columnCount != null) next = setSectionColumnCount(next, sectionId, patch.columnCount);
    if (patch.label != null || patch.style != null) {
      next = updateSection(next, sectionId, {
        ...(patch.label != null ? { label: patch.label } : {}),
        ...(patch.style != null ? { style: patch.style } : {}),
      });
    }
    commit(next);
  }

  const previewHtml = renderPageDocumentToHtml(document);

  return (
    <div className="-mx-6 -mb-6 flex flex-col border-t bg-background" style={{ height: "calc(100vh - 11rem)" }}>
      <PageBuilderToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        breakpoint={breakpoint}
        saved={saved}
        onUndo={undo}
        onRedo={redo}
        onBreakpoint={setBreakpoint}
        onPreview={() => setPreviewOpen(true)}
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
              <StructurePanel document={document} selection={selection} onSelect={setSelection} />
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
            onUpdateComponent={(sectionId, columnId, componentId, patch) =>
              commit(updateComponent(document, sectionId, columnId, componentId, patch))
            }
            onUpdateSection={handleUpdateSection}
          />
        </aside>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Pré-visualização — visão do aluno</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="prose prose-sm max-w-none p-4 bg-white rounded-lg border" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
