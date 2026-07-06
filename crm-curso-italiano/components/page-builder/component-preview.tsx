"use client";

import type { BoxStyle, PageComponent, TableCellData } from "@lms-mocks/page-builder-types";
import {
  HEADING_LEVEL_DEFAULTS,
  headingTag,
  headingTypographyStyle,
  normalizeHeadingLevel,
} from "@lms-mocks/heading-styles";
import {
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Star,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityPreviewContent } from "@/components/page-builder/editors/activity-editor";
import { useMockStore } from "@/lib/mock-store";

function spacingStyle(s?: BoxStyle["padding"]): React.CSSProperties | undefined {
  if (!s) return undefined;
  return { paddingTop: s.top, paddingRight: s.right, paddingBottom: s.bottom, paddingLeft: s.left };
}

function marginStyle(s?: BoxStyle["margin"]): React.CSSProperties | undefined {
  if (!s) return undefined;
  return { marginTop: s.top, marginRight: s.right, marginBottom: s.bottom, marginLeft: s.left };
}

function boxStyleToReact(style?: BoxStyle, options?: { excludeTypography?: boolean }): React.CSSProperties {
  if (!style) return {};
  return {
    ...spacingStyle(style.padding),
    ...marginStyle(style.margin),
    gap: style.gap,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundGradient ?? (style.backgroundImage ? `url(${style.backgroundImage})` : undefined),
    backgroundSize: style.backgroundImage ? "cover" : undefined,
    backgroundPosition: style.backgroundImage ? "center" : undefined,
    color: options?.excludeTypography ? undefined : style.color,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: style.borderWidth ? "solid" : undefined,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    fontFamily: options?.excludeTypography ? undefined : style.typography?.fontFamily,
    fontSize: options?.excludeTypography ? undefined : style.typography?.fontSize,
    fontWeight: options?.excludeTypography ? undefined : style.typography?.fontWeight,
    lineHeight: options?.excludeTypography ? undefined : style.typography?.lineHeight,
    letterSpacing: options?.excludeTypography ? undefined : style.typography?.letterSpacing,
    textAlign: options?.excludeTypography ? undefined : style.typography?.textAlign,
  };
}

function normalizeTableRows(raw: unknown): TableCellData[][] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    if (!Array.isArray(row)) return [{ content: "" }];
    return row.map((cell) => (typeof cell === "string" ? { content: cell } : (cell as TableCellData)));
  });
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "volume-2": Volume2,
  "alert-triangle": AlertTriangle,
  lightbulb: Lightbulb,
  "book-open": BookOpen,
  "message-square": MessageSquare,
  "help-circle": HelpCircle,
  star: Star,
};

function IconBadgePreview({ props }: { props: Record<string, unknown> }) {
  const Icon = ICON_MAP[String(props.icon ?? "volume-2")] ?? Volume2;
  const variant = String(props.variant ?? "info");
  const colors: Record<string, string> = {
    info: "bg-blue-600",
    warning: "bg-amber-500",
    tip: "bg-emerald-600",
  };
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center shrink-0 w-16">
        <div className={cn("size-10 rounded-lg flex items-center justify-center text-white", colors[variant] ?? colors.info)}>
          <Icon className="size-5" />
        </div>
        <p className="text-xs font-semibold text-blue-700 mt-1 text-center">
          {String(props.label ?? "")}
          {props.subtitle ? <span className="text-blue-400"> {String(props.subtitle)}</span> : null}
        </p>
      </div>
      {props.content ? (
        <div className="border-l-2 border-blue-200 pl-3 text-xs text-muted-foreground flex-1">{String(props.content)}</div>
      ) : null}
    </div>
  );
}

function ActivityPreviewBlock({ props }: { props: Record<string, unknown> }) {
  const { exercises } = useMockStore();
  const bankExercise = exercises.find((e) => e.id === props.exerciseId);
  return (
    <div className="space-y-2">
      {props.title ? <p className="font-semibold text-sm">{String(props.title)}</p> : null}
      {props.instructions ? <p className="text-sm text-muted-foreground">{String(props.instructions)}</p> : null}
      <ActivityPreviewContent props={props} bankExercise={bankExercise} />
    </div>
  );
}

export function ComponentPreview({ component, className }: { component: PageComponent; className?: string }) {
  const isHeading = component.type === "heading";
  const style = boxStyleToReact(component.style, { excludeTypography: isHeading });

  const inner = (() => {
    switch (component.type) {
      case "heading": {
        const level = normalizeHeadingLevel(component.props.level);
        const Tag = headingTag(level);
        const defaults = HEADING_LEVEL_DEFAULTS[level];
        const hs = headingTypographyStyle(level, component.style?.typography);
        return (
          <Tag
            className={defaults.tailwindClass}
            style={{
              fontSize: hs.fontSize,
              fontWeight: hs.fontWeight,
              lineHeight: hs.lineHeight,
              color: component.style?.color,
              textAlign: component.style?.typography?.textAlign,
            }}
          >
            {String(component.props.text ?? "")}
          </Tag>
        );
      }
      case "paragraph":
        return <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: String(component.props.text ?? "") }} />;
      case "image":
        return (
          <figure>
            {component.props.src ? (
              <img src={String(component.props.src)} alt={String(component.props.alt ?? "")} className="max-w-full rounded-lg" />
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">Imagem</div>
            )}
            {component.props.caption ? (
              <figcaption className="text-center text-xs text-muted-foreground mt-2">{String(component.props.caption)}</figcaption>
            ) : null}
          </figure>
        );
      case "video":
      case "embed":
        return (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {component.props.url ? (
              <iframe src={String(component.props.url)} className="w-full h-full border-0" title="embed" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm">Vídeo / Embed</div>
            )}
          </div>
        );
      case "button":
        return (
          <span
            className={cn(
              "inline-block px-4 py-2 rounded-lg font-semibold text-sm",
              component.props.variant === "outline" ? "border-2 border-primary text-primary" : "bg-primary text-primary-foreground",
            )}
          >
            {String(component.props.label ?? "Botão")}
          </span>
        );
      case "card":
        return (
          <div className="border rounded-xl p-4 bg-card">
            {component.props.imageUrl ? (
              <img src={String(component.props.imageUrl)} alt="" className="w-full h-28 object-cover rounded-lg mb-3" />
            ) : null}
            <p className="font-semibold">{String(component.props.title ?? "")}</p>
            <p className="text-sm text-muted-foreground mt-1">{String(component.props.description ?? "")}</p>
          </div>
        );
      case "alert":
      case "callout": {
        const v = String(component.props.variant ?? "info");
        const colors: Record<string, string> = {
          info: "bg-blue-50 border-blue-500",
          tip: "bg-green-50 border-green-500",
          warning: "bg-amber-50 border-amber-500",
          error: "bg-red-50 border-red-500",
        };
        return (
          <div className={cn("border-l-4 p-4 rounded-lg", colors[v] ?? colors.info)}>
            <p className="font-semibold text-sm">{String(component.props.title ?? "")}</p>
            <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: String(component.props.text ?? "") }} />
          </div>
        );
      }
      case "list": {
        const items = (component.props.items as string[]) ?? [];
        const Tag = component.props.ordered ? "ol" : "ul";
        return (
          <Tag className={cn("pl-5 space-y-1 text-sm", component.props.ordered ? "list-decimal" : "list-disc")}>
            {items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Tag>
        );
      }
      case "table": {
        const headers = (component.props.headers as string[]) ?? [];
        const rows = normalizeTableRows(component.props.rows);
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {headers.map((h, i) => (
                    <th key={i} className="border p-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="border p-2"
                        rowSpan={cell.rowspan}
                        colSpan={cell.colspan}
                        dangerouslySetInnerHTML={{ __html: cell.content }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "icon-badge":
        return <IconBadgePreview props={component.props} />;
      case "example-grid": {
        const cols = Number(component.props.columns ?? 2);
        const items = (component.props.items as { left: string; right?: string }[]) ?? [];
        return (
          <div className={cn("grid gap-2", cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-3" : "grid-cols-2")}>
            {items.map((item, i) => (
              <div key={i} className="bg-blue-50 rounded-lg px-3 py-2 text-sm">
                <span dangerouslySetInnerHTML={{ __html: item.left }} />
                {item.right ? (
                  <>
                    {" "}
                    <span className="text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: item.right }} />
                  </>
                ) : null}
              </div>
            ))}
          </div>
        );
      }
      case "dialogue-box": {
        const lines = (component.props.lines as { speaker: string; text: string }[]) ?? [];
        return (
          <div className="space-y-2">
            {component.props.context ? (
              <p className="text-sm text-muted-foreground italic">{String(component.props.context)}</p>
            ) : null}
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              {lines.map((line, i) => (
                <p key={i} className="text-sm">
                  <strong>{line.speaker}:</strong> {line.text}
                </p>
              ))}
            </div>
          </div>
        );
      }
      case "vocabulary-box": {
        const pairs = (component.props.pairs as { term: string; translation: string }[]) ?? [];
        const bg = String(component.props.backgroundColor ?? "#6b21a8");
        return (
          <div className="rounded-xl p-4 text-white" style={{ backgroundColor: bg }}>
            <p className="font-bold text-sm mb-3">{String(component.props.title ?? "Vocabulário")}</p>
            <div className="space-y-1.5">
              {pairs.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">{p.term}</span>
                  <span className="opacity-75">{p.translation}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "writing-lines": {
        const lineCount = Number(component.props.lineCount ?? 2);
        return (
          <div className="space-y-2">
            {component.props.prompt ? (
              <p className="text-sm font-medium">{String(component.props.prompt)}</p>
            ) : null}
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="border-b border-dashed border-muted-foreground/40 h-8" />
            ))}
          </div>
        );
      }
      case "infobox": {
        const sections = (component.props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? [];
        return (
          <div className="border-2 border-purple-800 rounded-lg overflow-hidden">
            <div className="bg-purple-800 text-white px-3 py-1.5 font-semibold text-sm">{String(component.props.title ?? "Infobox")}</div>
            <div className="p-3 space-y-3">
              {sections.map((sec, si) => (
                <div key={si}>
                  {sec.subtitle ? <p className="text-xs font-semibold text-purple-800 mb-1">{sec.subtitle}</p> : null}
                  {sec.rows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-2 gap-2 text-sm py-0.5">
                      <span>{row.left}</span>
                      <span className="text-muted-foreground text-right">{row.right}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "activity":
        return <ActivityPreviewBlock props={component.props} />;
      case "separator":
      case "divider":
        return <hr className="border-muted-foreground/20 my-4" />;
      case "accordion": {
        const items = (component.props.items as { title: string; content: string }[]) ?? [];
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <details key={i} className="border rounded-lg p-3" open={i === 0}>
                <summary className="font-medium cursor-pointer text-sm">{item.title}</summary>
                <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
              </details>
            ))}
          </div>
        );
      }
      case "tabs": {
        const items = (component.props.items as { label: string; content: string }[]) ?? [];
        return (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-primary">{item.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
              </div>
            ))}
          </div>
        );
      }
      case "quote":
        return (
          <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
            <p>{String(component.props.text ?? "")}</p>
            {component.props.author ? <cite className="text-xs not-italic block mt-2">— {String(component.props.author)}</cite> : null}
          </blockquote>
        );
      case "cta":
        return (
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50">
            <h3 className="font-bold text-lg">{String(component.props.title ?? "")}</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">{String(component.props.description ?? "")}</p>
            <span className="inline-block px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
              {String(component.props.buttonLabel ?? "Saiba mais")}
            </span>
          </div>
        );
      case "card-grid": {
        const cards = (component.props.cards as { title: string; description: string; imageUrl?: string }[]) ?? [];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card, i) => (
              <div key={i} className="border rounded-xl p-3 bg-card">
                {card.imageUrl ? <img src={card.imageUrl} alt="" className="w-full h-20 object-cover rounded-lg mb-2" /> : null}
                <p className="font-semibold text-sm">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
              </div>
            ))}
          </div>
        );
      }
      case "spacer":
        return <div style={{ height: Number(component.props.height ?? 32) }} aria-hidden />;
      case "code":
        return (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
            <code>{String(component.props.code ?? "")}</code>
          </pre>
        );
      case "file-download":
        return (
          <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
            <div>
              <p className="font-medium text-sm">{String(component.props.title ?? "")}</p>
              <p className="text-xs text-muted-foreground">{String(component.props.filename ?? "")}</p>
            </div>
            <span>📥</span>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">{component.type}</p>;
    }
  })();

  return (
    <div style={style} className={cn("min-w-0", className)}>
      {inner}
    </div>
  );
}

export function SectionPreviewStyle({ style, children }: { style?: BoxStyle; children: React.ReactNode }) {
  const mw =
    style?.maxWidth === "narrow"
      ? "max-w-xl"
      : style?.maxWidth === "wide"
        ? "max-w-4xl"
        : style?.maxWidth === "prose"
          ? "max-w-2xl"
          : "max-w-full";
  const align = style?.align === "center" ? "mx-auto" : style?.align === "right" ? "ml-auto" : "";
  return (
    <div style={boxStyleToReact(style)} className={cn(mw, align, "w-full")}>
      {children}
    </div>
  );
}
