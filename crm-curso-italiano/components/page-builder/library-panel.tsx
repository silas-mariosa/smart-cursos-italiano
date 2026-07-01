"use client";

import {
  AlignLeft,
  AlertCircle,
  ChevronsUpDown,
  Code,
  Download,
  ExternalLink,
  Image,
  LayoutGrid,
  Lightbulb,
  List,
  Megaphone,
  Minus,
  MousePointer,
  MoveVertical,
  PanelTop,
  Quote,
  SeparatorHorizontal,
  Square,
  Table,
  Type,
  Video,
} from "lucide-react";
import type { ComponentType } from "@lms-mocks/page-builder-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPONENT_CATALOG, getCatalogByCategory } from "@/lib/page-builder/catalog";
import { LAYOUT_TEMPLATES, getLayoutsByCategory, cloneLayoutSections } from "@/lib/page-builder/layouts";
import type { PageDocument, SavedLayout } from "@lms-mocks/page-builder-types";
import { appendLayout, replaceWithLayout } from "@/lib/page-builder/document";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  AlignLeft,
  Quote,
  List,
  Table,
  Lightbulb,
  Image,
  Video,
  ExternalLink,
  Download,
  MousePointer,
  Square,
  LayoutGrid,
  Megaphone,
  AlertCircle,
  Minus,
  MoveVertical,
  ChevronsUpDown,
  PanelTop,
  Code,
  SeparatorHorizontal,
};

interface LibraryPanelProps {
  document: PageDocument;
  activeSectionId: string | null;
  activeColumnId: string | null;
  onAddComponent: (type: ComponentType) => void;
  onApplyLayout: (sections: SavedLayout["sections"], mode: "append" | "replace") => void;
  onInsertReusable: (componentId: string) => void;
}

export function LibraryPanel({
  document,
  activeSectionId,
  activeColumnId,
  onAddComponent,
  onApplyLayout,
  onInsertReusable,
}: LibraryPanelProps) {
  const byCategory = getCatalogByCategory();
  const layoutsByCat = getLayoutsByCategory();

  return (
    <Tabs defaultValue="components" className="h-full flex flex-col">
      <TabsList className="mx-3 mt-3 grid grid-cols-3 h-8">
        <TabsTrigger value="components" className="text-xs">
          Blocos
        </TabsTrigger>
        <TabsTrigger value="layouts" className="text-xs">
          Layouts
        </TabsTrigger>
        <TabsTrigger value="reusable" className="text-xs">
          Salvos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="components" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-14rem)] px-3 pb-4">
          {!activeColumnId && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
              Selecione uma coluna no canvas para inserir componentes.
            </p>
          )}
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{cat}</p>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = ICONS[item.icon] ?? Square;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      disabled={!activeColumnId}
                      onClick={() => onAddComponent(item.type)}
                      className="w-full flex items-start gap-2 p-2 rounded-lg border text-left hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon className="size-4 mt-0.5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="layouts" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-14rem)] px-3 pb-4">
          {Object.entries(layoutsByCat).map(([cat, layouts]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{cat}</p>
              <div className="space-y-2">
                {layouts.map((layout) => (
                  <div key={layout.id} className="border rounded-lg p-2 space-y-2">
                    <div>
                      <p className="text-xs font-medium">{layout.name}</p>
                      <p className="text-[10px] text-muted-foreground">{layout.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="flex-1 text-[10px] py-1 px-2 rounded bg-primary text-primary-foreground"
                        onClick={() => onApplyLayout(cloneLayoutSections(layout), "append")}
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        className="flex-1 text-[10px] py-1 px-2 rounded border"
                        onClick={() => {
                          if (confirm("Substituir todo o conteúdo atual?")) {
                            onApplyLayout(cloneLayoutSections(layout), "replace");
                          }
                        }}
                      >
                        Substituir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {document.savedLayouts.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Meus templates</p>
              {document.savedLayouts.map((layout) => (
                <div key={layout.id} className="border rounded-lg p-2 mb-2">
                  <p className="text-xs font-medium">{layout.name}</p>
                  <button
                    type="button"
                    className="mt-1 text-[10px] text-primary"
                    onClick={() => onApplyLayout(cloneLayoutSections(layout), "append")}
                  >
                    Usar template
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="reusable" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-14rem)] px-3 pb-4">
          {document.reusableBlocks.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">Nenhum bloco reutilizável ainda. Salve um componente pelo painel de propriedades.</p>
          ) : (
            document.reusableBlocks.map((block) => (
              <button
                key={block.id}
                type="button"
                disabled={!activeColumnId}
                onClick={() => onInsertReusable(block.id)}
                className="w-full text-left border rounded-lg p-2 mb-2 hover:border-primary disabled:opacity-40"
              >
                <p className="text-xs font-medium">{block.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {block.category} {block.linked ? "· vinculado" : "· independente"}
                </p>
              </button>
            ))
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

export { COMPONENT_CATALOG, LAYOUT_TEMPLATES };
