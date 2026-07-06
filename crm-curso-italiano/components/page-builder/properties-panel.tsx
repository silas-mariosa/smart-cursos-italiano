"use client";

import { useEffect, useState } from "react";
import type { BoxStyle, PageComponent, PageDocument, SelectionTarget, Spacing, TableCellData } from "@lms-mocks/page-builder-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { getCatalogLabel } from "@/lib/page-builder/catalog";
import { resolveSelection } from "@/lib/page-builder/document";
import { saveReusableBlock } from "@/lib/page-builder/document";
import { headingStylePatchForLevel, normalizeHeadingLevel } from "@lms-mocks/heading-styles";
import { TableEditor } from "@/components/page-builder/editors/table-editor";
import { ActivityEditor } from "@/components/page-builder/editors/activity-editor";
import {
  buildShadowFromIntensity,
  getUniformSpacing,
  loadStyleEditorMode,
  normalizeFontWeight,
  parseShadowIntensity,
  saveStyleEditorMode,
  uniformSpacing,
  type StyleEditorMode,
} from "@/lib/page-builder/style-editor-helpers";

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
  onUpdateSection: (sectionId: string, patch: Partial<{ label: string; style: BoxStyle; columnCount: number; layoutDirection: "columns" | "rows" }>) => void;
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

function StyleModeToggle({ mode, onChange }: { mode: StyleEditorMode; onChange: (mode: StyleEditorMode) => void }) {
  return (
    <div className="flex rounded-md border bg-muted/30 p-0.5">
      <Button
        type="button"
        size="sm"
        variant={mode === "basic" ? "default" : "ghost"}
        className="h-7 flex-1 text-xs"
        onClick={() => onChange("basic")}
      >
        Básico
      </Button>
      <Button
        type="button"
        size="sm"
        variant={mode === "professional" ? "default" : "ghost"}
        className="h-7 flex-1 text-xs"
        onClick={() => onChange("professional")}
      >
        Profissional
      </Button>
    </div>
  );
}

function StyleEditor({
  style,
  mode,
  onModeChange,
  onChange,
}: {
  style?: BoxStyle;
  mode: StyleEditorMode;
  onModeChange: (mode: StyleEditorMode) => void;
  onChange: (s: BoxStyle) => void;
}) {
  const s = style ?? {};

  return (
    <div className="space-y-3">
      <StyleModeToggle mode={mode} onChange={onModeChange} />
      <p className="text-[11px] text-muted-foreground">
        {mode === "basic"
          ? "Use os sliders para ajustes rápidos. Ative o modo profissional para editar valores manualmente."
          : "Edite cada valor com precisão. Volte ao modo básico para usar sliders."}
      </p>

      {mode === "basic" ? (
        <>
          <Slider
            label="Padding (px)"
            value={getUniformSpacing(s.padding)}
            min={0}
            max={80}
            unit="px"
            onChange={(value) => onChange({ ...s, padding: uniformSpacing(value) })}
          />
          <Slider
            label="Margin (px)"
            value={getUniformSpacing(s.margin)}
            min={0}
            max={80}
            unit="px"
            onChange={(value) => onChange({ ...s, margin: uniformSpacing(value) })}
          />
          <Slider
            label="Gap (px)"
            value={s.gap ?? 0}
            min={0}
            max={64}
            unit="px"
            onChange={(value) => onChange({ ...s, gap: value || undefined })}
          />
          <Slider
            label="Border radius"
            value={s.borderRadius ?? 0}
            min={0}
            max={48}
            unit="px"
            onChange={(value) => onChange({ ...s, borderRadius: value || undefined })}
          />
        </>
      ) : (
        <>
          <SpacingEditor label="Padding (px)" value={s.padding} onChange={(padding) => onChange({ ...s, padding })} />
          <SpacingEditor label="Margin (px)" value={s.margin} onChange={(margin) => onChange({ ...s, margin })} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Gap (px)</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={s.gap ?? ""}
                onChange={(e) => onChange({ ...s, gap: Number(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Border radius</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={s.borderRadius ?? ""}
                onChange={(e) => onChange({ ...s, borderRadius: Number(e.target.value) || undefined })}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Cor de fundo</Label>
        <Input type="color" className="h-8 w-full" value={s.backgroundColor ?? "#ffffff"} onChange={(e) => onChange({ ...s, backgroundColor: e.target.value })} />
      </div>
      {mode === "professional" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Gradiente CSS</Label>
            <Input className="h-8 text-xs" placeholder="linear-gradient(...)" value={s.backgroundGradient ?? ""} onChange={(e) => onChange({ ...s, backgroundGradient: e.target.value || undefined })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Imagem de fundo (URL)</Label>
            <Input className="h-8 text-xs" value={s.backgroundImage ?? ""} onChange={(e) => onChange({ ...s, backgroundImage: e.target.value || undefined })} />
          </div>
        </>
      )}
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
      {mode === "basic" ? (
        <>
          <Slider
            label="Peso fonte"
            value={normalizeFontWeight(s.typography?.fontWeight)}
            min={300}
            max={900}
            step={100}
            onChange={(value) => onChange({ ...s, typography: { ...s.typography, fontWeight: value } })}
          />
          <Slider
            label="Sombra"
            value={parseShadowIntensity(s.boxShadow)}
            min={0}
            max={100}
            onChange={(value) => onChange({ ...s, boxShadow: buildShadowFromIntensity(value) })}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tamanho fonte</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={s.typography?.fontSize ?? ""}
                onChange={(e) => onChange({ ...s, typography: { ...s.typography, fontSize: Number(e.target.value) || undefined } })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Peso fonte</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={s.typography?.fontWeight ?? ""}
                onChange={(e) => onChange({ ...s, typography: { ...s.typography, fontWeight: Number(e.target.value) || undefined } })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sombra CSS</Label>
            <Input
              className="h-8 text-xs"
              placeholder="0 4px 6px rgba(0,0,0,0.1)"
              value={s.boxShadow ?? ""}
              onChange={(e) => onChange({ ...s, boxShadow: e.target.value || undefined })}
            />
          </div>
        </>
      )}
    </div>
  );
}

function normalizeTableRows(raw: unknown): TableCellData[][] {
  if (!Array.isArray(raw)) return [[{ content: "" }]];
  return raw.map((row) => {
    if (!Array.isArray(row)) return [{ content: "" }];
    return row.map((cell) => (typeof cell === "string" ? { content: cell } : (cell as TableCellData)));
  });
}

function ComponentPropsEditor({
  component,
  onChange,
  onPatch,
}: {
  component: PageComponent;
  onChange: (props: Record<string, unknown>) => void;
  onPatch?: (patch: { props?: Record<string, unknown>; style?: BoxStyle }) => void;
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
            <select
              className="w-full h-9 border rounded-md px-2 text-sm bg-background"
              value={Number(props.level ?? 2)}
              onChange={(e) => {
                const level = normalizeHeadingLevel(Number(e.target.value));
                const levelStyle = headingStylePatchForLevel(level);
                if (onPatch) {
                  onPatch({
                    props: { ...props, level },
                    style: {
                      ...component.style,
                      typography: {
                        ...component.style?.typography,
                        ...levelStyle.typography,
                      },
                    },
                  });
                } else {
                  set("level", level);
                }
              }}
            >
              <option value={2}>H2 — Grande (28px)</option>
              <option value={3}>H3 — Médio (22px)</option>
              <option value={4}>H4 — Pequeno (18px)</option>
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
    case "table":
      return (
        <TableEditor
          headers={(props.headers as string[]) ?? ["Coluna 1", "Coluna 2"]}
          rows={normalizeTableRows(props.rows)}
          onChange={(headers, rows) => onChange({ ...props, headers, rows })}
        />
      );
    case "icon-badge":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Ícone</Label>
            <select className="w-full h-9 border rounded-md px-2 text-sm bg-background" value={String(props.icon ?? "volume-2")} onChange={(e) => set("icon", e.target.value)}>
              <option value="volume-2">Áudio (volume)</option>
              <option value="alert-triangle">Atenção (triângulo)</option>
              <option value="lightbulb">Dica (lâmpada)</option>
              <option value="book-open">Livro / Seção</option>
              <option value="message-square">Diálogo</option>
              <option value="help-circle">Ajuda</option>
              <option value="star">Destaque</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rótulo</Label>
            <Input value={String(props.label ?? "")} onChange={(e) => set("label", e.target.value)} placeholder="Áudio" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subtítulo</Label>
            <Input value={String(props.subtitle ?? "")} onChange={(e) => set("subtitle", e.target.value)} placeholder="|" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Texto lateral</Label>
            <Textarea rows={3} value={String(props.content ?? "")} onChange={(e) => set("content", e.target.value)} placeholder="Exceções, notas..." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Variante</Label>
            <select className="w-full h-9 border rounded-md px-2 text-sm bg-background" value={String(props.variant ?? "info")} onChange={(e) => set("variant", e.target.value)}>
              <option value="info">Informação (azul)</option>
              <option value="warning">Atenção (âmbar)</option>
              <option value="tip">Dica (verde)</option>
            </select>
          </div>
        </div>
      );
    case "example-grid":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Colunas</Label>
            <select className="w-full h-8 border rounded-md px-2 text-xs bg-background" value={Number(props.columns ?? 2)} onChange={(e) => set("columns", Number(e.target.value))}>
              <option value={1}>1 coluna</option>
              <option value={2}>2 colunas</option>
              <option value={3}>3 colunas</option>
            </select>
          </div>
          {((props.items as { left: string; right?: string }[]) ?? []).map((item, i) => (
            <div key={i} className="border rounded-lg p-2 space-y-1">
              <Input className="h-8 text-xs" value={item.left} placeholder="Exemplo (EN)" onChange={(e) => {
                const items = [...((props.items as { left: string; right?: string }[]) ?? [])];
                items[i] = { ...items[i], left: e.target.value };
                set("items", items);
              }} />
              <Input className="h-8 text-xs" value={item.right ?? ""} placeholder="Tradução / contração" onChange={(e) => {
                const items = [...((props.items as { left: string; right?: string }[]) ?? [])];
                items[i] = { ...items[i], right: e.target.value };
                set("items", items);
              }} />
              <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => {
                const items = ((props.items as { left: string; right?: string }[]) ?? []).filter((_, j) => j !== i);
                set("items", items);
              }}>Remover</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...((props.items as { left: string; right?: string }[]) ?? []), { left: "Novo exemplo", right: "" }])}>
            + Exemplo
          </Button>
        </div>
      );
    case "dialogue-box":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Contexto</Label>
            <Textarea rows={2} value={String(props.context ?? "")} onChange={(e) => set("context", e.target.value)} />
          </div>
          {((props.lines as { speaker: string; text: string }[]) ?? []).map((line, i) => (
            <div key={i} className="border rounded-lg p-2 space-y-1">
              <Input className="h-8 text-xs" value={line.speaker} placeholder="Falante" onChange={(e) => {
                const lines = [...((props.lines as { speaker: string; text: string }[]) ?? [])];
                lines[i] = { ...lines[i], speaker: e.target.value };
                set("lines", lines);
              }} />
              <Textarea rows={2} className="text-xs" value={line.text} onChange={(e) => {
                const lines = [...((props.lines as { speaker: string; text: string }[]) ?? [])];
                lines[i] = { ...lines[i], text: e.target.value };
                set("lines", lines);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("lines", [...((props.lines as { speaker: string; text: string }[]) ?? []), { speaker: "Nome", text: "Fala..." }])}>
            + Linha de diálogo
          </Button>
        </div>
      );
    case "vocabulary-box":
      return (
        <div className="space-y-2">
          <Input placeholder="Título" value={String(props.title ?? "")} onChange={(e) => set("title", e.target.value)} />
          <div className="space-y-1">
            <Label className="text-xs">Cor de fundo</Label>
            <Input type="color" className="h-8 w-full" value={String(props.backgroundColor ?? "#6b21a8")} onChange={(e) => set("backgroundColor", e.target.value)} />
          </div>
          {((props.pairs as { term: string; translation: string }[]) ?? []).map((pair, i) => (
            <div key={i} className="flex gap-1">
              <Input className="h-8 text-xs flex-1" value={pair.term} placeholder="Termo" onChange={(e) => {
                const pairs = [...((props.pairs as { term: string; translation: string }[]) ?? [])];
                pairs[i] = { ...pairs[i], term: e.target.value };
                set("pairs", pairs);
              }} />
              <Input className="h-8 text-xs flex-1" value={pair.translation} placeholder="Tradução" onChange={(e) => {
                const pairs = [...((props.pairs as { term: string; translation: string }[]) ?? [])];
                pairs[i] = { ...pairs[i], translation: e.target.value };
                set("pairs", pairs);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("pairs", [...((props.pairs as { term: string; translation: string }[]) ?? []), { term: "", translation: "" }])}>
            + Par
          </Button>
        </div>
      );
    case "writing-lines":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Enunciado / palavras-chave</Label>
            <Textarea rows={2} value={String(props.prompt ?? "")} onChange={(e) => set("prompt", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Número de linhas</Label>
            <Input type="number" min={1} max={6} value={Number(props.lineCount ?? 2)} onChange={(e) => set("lineCount", Number(e.target.value))} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={!!props.showNumbers} onChange={(e) => set("showNumbers", e.target.checked)} />
            Mostrar numeração
          </label>
        </div>
      );
    case "infobox":
      return (
        <div className="space-y-2">
          <Input placeholder="Título" value={String(props.title ?? "Infobox")} onChange={(e) => set("title", e.target.value)} />
          {((props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? []).map((section, si) => (
            <div key={si} className="border rounded-lg p-2 space-y-1">
              <Input className="h-8 text-xs" value={section.subtitle} placeholder="Subtítulo" onChange={(e) => {
                const sections = [...((props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? [])];
                sections[si] = { ...sections[si], subtitle: e.target.value };
                set("sections", sections);
              }} />
              {section.rows.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                  <Input className="h-7 text-xs flex-1" value={row.left} onChange={(e) => {
                    const sections = [...((props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? [])];
                    sections[si].rows[ri] = { ...sections[si].rows[ri], left: e.target.value };
                    set("sections", sections);
                  }} />
                  <Input className="h-7 text-xs flex-1" value={row.right} onChange={(e) => {
                    const sections = [...((props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? [])];
                    sections[si].rows[ri] = { ...sections[si].rows[ri], right: e.target.value };
                    set("sections", sections);
                  }} />
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => {
                const sections = [...((props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? [])];
                sections[si].rows.push({ left: "", right: "" });
                set("sections", sections);
              }}>+ Linha</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("sections", [...((props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? []), { subtitle: "Nova seção", rows: [{ left: "", right: "" }] }])}>
            + Seção
          </Button>
        </div>
      );
    case "activity":
      return <ActivityEditor props={props} onChange={onChange} />;
    case "accordion":
      return (
        <div className="space-y-2">
          {((props.items as { title: string; content: string }[]) ?? []).map((item, i) => (
            <div key={i} className="border rounded-lg p-2 space-y-1">
              <Input value={item.title} onChange={(e) => {
                const items = [...((props.items as { title: string; content: string }[]) ?? [])];
                items[i] = { ...items[i], title: e.target.value };
                set("items", items);
              }} />
              <Textarea rows={2} className="text-xs" value={item.content} onChange={(e) => {
                const items = [...((props.items as { title: string; content: string }[]) ?? [])];
                items[i] = { ...items[i], content: e.target.value };
                set("items", items);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...((props.items as { title: string; content: string }[]) ?? []), { title: "Pergunta", content: "Resposta" }])}>
            + Item
          </Button>
        </div>
      );
    case "tabs":
      return (
        <div className="space-y-2">
          {((props.items as { label: string; content: string }[]) ?? []).map((item, i) => (
            <div key={i} className="border rounded-lg p-2 space-y-1">
              <Input value={item.label} onChange={(e) => {
                const items = [...((props.items as { label: string; content: string }[]) ?? [])];
                items[i] = { ...items[i], label: e.target.value };
                set("items", items);
              }} />
              <Textarea rows={2} className="text-xs" value={item.content} onChange={(e) => {
                const items = [...((props.items as { label: string; content: string }[]) ?? [])];
                items[i] = { ...items[i], content: e.target.value };
                set("items", items);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...((props.items as { label: string; content: string }[]) ?? []), { label: "Nova aba", content: "" }])}>
            + Aba
          </Button>
        </div>
      );
    case "card-grid":
      return (
        <div className="space-y-2">
          {((props.cards as { title: string; description: string; imageUrl?: string }[]) ?? []).map((card, i) => (
            <div key={i} className="border rounded-lg p-2 space-y-1">
              <Input value={card.title} onChange={(e) => {
                const cards = [...((props.cards as { title: string; description: string }[]) ?? [])];
                cards[i] = { ...cards[i], title: e.target.value };
                set("cards", cards);
              }} />
              <Input value={card.description} onChange={(e) => {
                const cards = [...((props.cards as { title: string; description: string }[]) ?? [])];
                cards[i] = { ...cards[i], description: e.target.value };
                set("cards", cards);
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("cards", [...((props.cards as { title: string; description: string }[]) ?? []), { title: "Novo card", description: "" }])}>
            + Card
          </Button>
        </div>
      );
    default:
      return <p className="text-xs text-muted-foreground">Edite visualmente no canvas ou use propriedades de estilo.</p>;
  }
}

export function PropertiesPanel({ document, selection, onUpdateDocument, onUpdateComponent, onUpdateSection, onUpdateColumn }: PropertiesPanelProps) {
  const resolved = resolveSelection(document, selection);
  const [styleMode, setStyleMode] = useState<StyleEditorMode>("basic");

  useEffect(() => {
    setStyleMode(loadStyleEditorMode());
  }, []);

  function handleStyleModeChange(mode: StyleEditorMode) {
    setStyleMode(mode);
    saveStyleEditorMode(mode);
  }

  if (!resolved || !selection) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center space-y-2">
        {document.sections.length === 0 ? (
          <>
            <p className="font-medium text-foreground">Página vazia</p>
            <p className="text-xs">Adicione uma seção no canvas ou aplique um layout pela biblioteca.</p>
          </>
        ) : (
          <p>Selecione uma seção, coluna ou componente para editar as propriedades.</p>
        )}
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
                    onClick={() =>
                      onUpdateSection(section.id, {
                        columnCount: n,
                        ...(n === 1 ? { layoutDirection: "columns" as const } : {}),
                      })
                    }
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            {section.columnCount > 1 && (
              <div className="space-y-1 mt-2">
                <Label className="text-xs">Disposição</Label>
                <div className="flex rounded-md border bg-muted/30 p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={(section.layoutDirection ?? "columns") === "columns" ? "default" : "ghost"}
                    className="h-7 flex-1 text-xs"
                    onClick={() => onUpdateSection(section.id, { layoutDirection: "columns" })}
                  >
                    Colunas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={section.layoutDirection === "rows" ? "default" : "ghost"}
                    className="h-7 flex-1 text-xs"
                    onClick={() => onUpdateSection(section.id, { layoutDirection: "rows" })}
                  >
                    Linhas
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {section.layoutDirection === "rows"
                    ? "As áreas ficam empilhadas verticalmente."
                    : "As áreas ficam lado a lado na horizontal."}
                </p>
              </div>
            )}
          </div>
          <Separator />
          <StyleEditor
            style={section.style}
            mode={styleMode}
            onModeChange={handleStyleModeChange}
            onChange={(style) => onUpdateSection(section.id, { style })}
          />
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
            onPatch={(patch) => onUpdateComponent(section.id, column.id, row.id, component.id, patch)}
          />
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estilo</p>
          <StyleEditor
            style={component.style}
            mode={styleMode}
            onModeChange={handleStyleModeChange}
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
          <StyleEditor
            style={column.style}
            mode={styleMode}
            onModeChange={handleStyleModeChange}
            onChange={(style) => onUpdateColumn(section.id, column.id, { style })}
          />
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
