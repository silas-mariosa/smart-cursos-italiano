"use client";

import type { BoxStyle, PageComponent, PageDocument, SelectionTarget, Spacing } from "@lms-mocks/page-builder-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getCatalogLabel } from "@/lib/page-builder/catalog";
import { resolveSelection } from "@/lib/page-builder/document";
import { saveReusableBlock } from "@/lib/page-builder/document";

interface PropertiesPanelProps {
  document: PageDocument;
  selection: SelectionTarget;
  onUpdateDocument: (doc: PageDocument) => void;
  onUpdateComponent: (
    sectionId: string,
    columnId: string,
    rowId: string,
    componentId: string,
    patch: { props?: Record<string, unknown>; style?: BoxStyle },
  ) => void;
  onUpdateSection: (sectionId: string, patch: Partial<{ label: string; style: BoxStyle; columnCount: number }>) => void;
  onUpdateColumn: (
    sectionId: string,
    columnId: string,
    patch: Partial<{ rowCount: number; style: BoxStyle }>,
  ) => void;
}

function SpacingEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Spacing;
  onChange: (v: Spacing) => void;
}) {
  const v = value ?? {};
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="grid grid-cols-4 gap-1">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Input
            key={side}
            type="number"
            min={0}
            placeholder={side[0].toUpperCase()}
            className="h-8 text-xs px-2"
            value={v[side] ?? ""}
            onChange={(e) => onChange({ ...v, [side]: e.target.value ? Number(e.target.value) : undefined })}
          />
        ))}
      </div>
    </div>
  );
}

function StyleEditor({ style, onChange }: { style?: BoxStyle; onChange: (s: BoxStyle) => void }) {
  const s = style ?? {};
  return (
    <div className="space-y-3">
      <SpacingEditor label="Padding (px)" value={s.padding} onChange={(padding) => onChange({ ...s, padding })} />
      <SpacingEditor label="Margin (px)" value={s.margin} onChange={(margin) => onChange({ ...s, margin })} />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Gap (px)</Label>
          <Input type="number" className="h-8 text-xs" value={s.gap ?? ""} onChange={(e) => onChange({ ...s, gap: Number(e.target.value) || undefined })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Border radius</Label>
          <Input type="number" className="h-8 text-xs" value={s.borderRadius ?? ""} onChange={(e) => onChange({ ...s, borderRadius: Number(e.target.value) || undefined })} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Cor de fundo</Label>
        <Input type="color" className="h-8 w-full" value={s.backgroundColor ?? "#ffffff"} onChange={(e) => onChange({ ...s, backgroundColor: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Gradiente CSS</Label>
        <Input className="h-8 text-xs" placeholder="linear-gradient(...)" value={s.backgroundGradient ?? ""} onChange={(e) => onChange({ ...s, backgroundGradient: e.target.value || undefined })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Imagem de fundo (URL)</Label>
        <Input className="h-8 text-xs" value={s.backgroundImage ?? ""} onChange={(e) => onChange({ ...s, backgroundImage: e.target.value || undefined })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Cor do texto</Label>
        <Input type="color" className="h-8 w-full" value={s.color ?? "#000000"} onChange={(e) => onChange({ ...s, color: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Largura máx.</Label>
          <select
            className="w-full h-8 text-xs border rounded-md px-2 bg-background"
            value={String(s.maxWidth ?? "full")}
            onChange={(e) => onChange({ ...s, maxWidth: e.target.value as BoxStyle["maxWidth"] })}
          >
            <option value="full">Completa</option>
            <option value="wide">Larga</option>
            <option value="prose">Prosa</option>
            <option value="narrow">Estreita</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Alinhamento</Label>
          <select
            className="w-full h-8 text-xs border rounded-md px-2 bg-background"
            value={s.align ?? "left"}
            onChange={(e) => onChange({ ...s, align: e.target.value as BoxStyle["align"] })}
          >
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Tamanho fonte</Label>
          <Input type="number" className="h-8 text-xs" value={s.typography?.fontSize ?? ""} onChange={(e) => onChange({ ...s, typography: { ...s.typography, fontSize: Number(e.target.value) || undefined } })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Peso fonte</Label>
          <Input type="number" className="h-8 text-xs" value={s.typography?.fontWeight ?? ""} onChange={(e) => onChange({ ...s, typography: { ...s.typography, fontWeight: Number(e.target.value) || undefined } })} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Sombra CSS</Label>
        <Input className="h-8 text-xs" placeholder="0 4px 6px rgba(0,0,0,0.1)" value={s.boxShadow ?? ""} onChange={(e) => onChange({ ...s, boxShadow: e.target.value || undefined })} />
      </div>
    </div>
  );
}

function ComponentPropsEditor({
  component,
  onChange,
}: {
  component: PageComponent;
  onChange: (props: Record<string, unknown>) => void;
}) {
  const props = component.props;
  const set = (key: string, value: unknown) => onChange({ ...props, [key]: value });

  switch (component.type) {
    case "heading":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Texto</Label>
            <Input value={String(props.text ?? "")} onChange={(e) => set("text", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nível</Label>
            <select className="w-full h-9 border rounded-md px-2 text-sm bg-background" value={Number(props.level ?? 2)} onChange={(e) => set("level", Number(e.target.value))}>
              <option value={2}>H2 — Grande</option>
              <option value={3}>H3 — Médio</option>
              <option value={4}>H4 — Pequeno</option>
            </select>
          </div>
        </div>
      );
    case "paragraph":
    case "quote":
      return (
        <div className="space-y-1">
          <Label className="text-xs">Conteúdo</Label>
          <Textarea rows={4} value={String(props.text ?? "")} onChange={(e) => set("text", e.target.value)} />
          {component.type === "quote" && (
            <>
              <Label className="text-xs mt-2">Autor</Label>
              <Input value={String(props.author ?? "")} onChange={(e) => set("author", e.target.value)} />
            </>
          )}
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">URL</Label>
            <Input value={String(props.src ?? "")} onChange={(e) => set("src", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alt</Label>
            <Input value={String(props.alt ?? "")} onChange={(e) => set("alt", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Legenda</Label>
            <Input value={String(props.caption ?? "")} onChange={(e) => set("caption", e.target.value)} />
          </div>
        </div>
      );
    case "video":
    case "embed":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">URL embed</Label>
            <Input value={String(props.url ?? "")} onChange={(e) => set("url", e.target.value)} placeholder="YouTube, Vimeo, PDF..." />
          </div>
          {component.type === "embed" && (
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <select className="w-full h-9 border rounded-md px-2 text-sm bg-background" value={String(props.embedType ?? "youtube")} onChange={(e) => set("embedType", e.target.value)}>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="pdf">PDF</option>
                <option value="google-docs">Google Docs</option>
                <option value="generic">Genérico</option>
              </select>
            </div>
          )}
        </div>
      );
    case "button":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input value={String(props.label ?? "")} onChange={(e) => set("label", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL</Label>
            <Input value={String(props.url ?? "")} onChange={(e) => set("url", e.target.value)} />
          </div>
        </div>
      );
    case "callout":
    case "alert":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Variante</Label>
            <select className="w-full h-9 border rounded-md px-2 text-sm bg-background" value={String(props.variant ?? "info")} onChange={(e) => set("variant", e.target.value)}>
              <option value="info">Informação</option>
              <option value="tip">Dica</option>
              <option value="warning">Atenção</option>
              <option value="error">Erro</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input value={String(props.title ?? "")} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Texto</Label>
            <Textarea rows={3} value={String(props.text ?? "")} onChange={(e) => set("text", e.target.value)} />
          </div>
        </div>
      );
    case "spacer":
      return (
        <div className="space-y-1">
          <Label className="text-xs">Altura (px)</Label>
          <Input type="number" value={Number(props.height ?? 32)} onChange={(e) => set("height", Number(e.target.value))} />
        </div>
      );
    case "code":
      return (
        <div className="space-y-1">
          <Label className="text-xs">Código</Label>
          <Textarea rows={5} className="font-mono text-xs" value={String(props.code ?? "")} onChange={(e) => set("code", e.target.value)} />
        </div>
      );
    case "file-download":
      return (
        <div className="space-y-2">
          <Input placeholder="Título" value={String(props.title ?? "")} onChange={(e) => set("title", e.target.value)} />
          <Input placeholder="Nome arquivo" value={String(props.filename ?? "")} onChange={(e) => set("filename", e.target.value)} />
          <Input placeholder="URL" value={String(props.url ?? "")} onChange={(e) => set("url", e.target.value)} />
        </div>
      );
    case "cta":
      return (
        <div className="space-y-2">
          <Input placeholder="Título" value={String(props.title ?? "")} onChange={(e) => set("title", e.target.value)} />
          <Textarea placeholder="Descrição" rows={2} value={String(props.description ?? "")} onChange={(e) => set("description", e.target.value)} />
          <Input placeholder="Botão" value={String(props.buttonLabel ?? "")} onChange={(e) => set("buttonLabel", e.target.value)} />
          <Input placeholder="URL" value={String(props.buttonUrl ?? "")} onChange={(e) => set("buttonUrl", e.target.value)} />
        </div>
      );
    case "card":
      return (
        <div className="space-y-2">
          <Input placeholder="Título" value={String(props.title ?? "")} onChange={(e) => set("title", e.target.value)} />
          <Textarea placeholder="Descrição" rows={2} value={String(props.description ?? "")} onChange={(e) => set("description", e.target.value)} />
          <Input placeholder="URL imagem" value={String(props.imageUrl ?? "")} onChange={(e) => set("imageUrl", e.target.value)} />
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={!!props.ordered} onChange={(e) => set("ordered", e.target.checked)} />
            Lista numerada
          </label>
          {((props.items as string[]) ?? []).map((item, i) => (
            <Input
              key={i}
              value={item}
              onChange={(e) => {
                const items = [...((props.items as string[]) ?? [])];
                items[i] = e.target.value;
                set("items", items);
              }}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...((props.items as string[]) ?? []), "Novo item"])}>
            + Item
          </Button>
        </div>
      );
    default:
      return <p className="text-xs text-muted-foreground">Edite visualmente no canvas ou use propriedades de estilo.</p>;
  }
}

export function PropertiesPanel({ document, selection, onUpdateDocument, onUpdateComponent, onUpdateSection, onUpdateColumn }: PropertiesPanelProps) {
  const resolved = resolveSelection(document, selection);

  if (!resolved || !selection) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        Selecione uma seção, coluna ou componente para editar as propriedades.
      </div>
    );
  }

  if (resolved.kind === "section" && resolved.section) {
    const section = resolved.section;
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Seção</p>
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input value={section.label} onChange={(e) => onUpdateSection(section.id, { label: e.target.value })} />
            </div>
            <div className="space-y-1 mt-2">
              <Label className="text-xs">Colunas</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={section.columnCount === n ? "default" : "outline"}
                    className="flex-1 h-8"
                    onClick={() => onUpdateSection(section.id, { columnCount: n })}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <StyleEditor style={section.style} onChange={(style) => onUpdateSection(section.id, { style })} />
        </div>
      </ScrollArea>
    );
  }

  if (resolved.kind === "component" && resolved.component && resolved.section && resolved.column && resolved.row) {
    const { component, section, column, row } = resolved;
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Componente</p>
            <p className="font-medium text-sm">{getCatalogLabel(component.type)}</p>
          </div>
          <ComponentPropsEditor
            component={component}
            onChange={(props) => onUpdateComponent(section.id, column.id, row.id, component.id, { props })}
          />
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estilo</p>
          <StyleEditor
            style={component.style}
            onChange={(style) => onUpdateComponent(section.id, column.id, row.id, component.id, { style })}
          />
          <Separator />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const name = prompt("Nome do bloco reutilizável:", component.type);
              if (!name) return;
              const linked = confirm("Atualização centralizada? (OK = sim, Cancelar = cópia independente)");
              onUpdateDocument(saveReusableBlock(document, component, name, "Personalizado", linked));
            }}
          >
            Salvar como reutilizável
          </Button>
        </div>
      </ScrollArea>
    );
  }

  if (resolved.kind === "row" && resolved.row && resolved.column && resolved.section) {
    const { row, column, section } = resolved;
    const rowIndex = column.rows.findIndex((r) => r.id === row.id) + 1;
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Linha {rowIndex}</p>
            <p className="text-sm text-muted-foreground">
              Adicione componentes nesta linha pela biblioteca ou clique na coluna para dividir em mais linhas.
            </p>
            <p className="text-xs text-muted-foreground mt-2">{row.components.length} componente(s)</p>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Coluna com {column.rowCount} linha{column.rowCount > 1 ? "s" : ""} · Seção {section.label}
          </p>
        </div>
      </ScrollArea>
    );
  }

  if (resolved.kind === "column" && resolved.column && resolved.section) {
    const { column, section } = resolved;
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Coluna</p>
            <p className="text-sm text-muted-foreground mb-3">
              Divida a coluna em linhas para organizar o conteúdo em faixas horizontais.
            </p>
            <div className="space-y-1">
              <Label className="text-xs">Linhas</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={column.rowCount === n ? "default" : "outline"}
                    className="flex-1 h-8"
                    onClick={() => onUpdateColumn(section.id, column.id, { rowCount: n })}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Clique em uma linha no canvas para adicionar blocos nela.
            </p>
          </div>
          <Separator />
          <StyleEditor style={column.style} onChange={(style) => onUpdateColumn(section.id, column.id, { style })} />
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="p-4 text-sm text-muted-foreground">
      Selecione uma seção, coluna, linha ou componente para editar as propriedades.
    </div>
  );
}
