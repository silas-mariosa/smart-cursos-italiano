"use client";

import type { BoxStyle, PageComponent } from "@lms-mocks/page-builder-types";
import { cn } from "@/lib/utils";

function spacingStyle(s?: BoxStyle["padding"]): React.CSSProperties | undefined {
  if (!s) return undefined;
  return { paddingTop: s.top, paddingRight: s.right, paddingBottom: s.bottom, paddingLeft: s.left };
}

function marginStyle(s?: BoxStyle["margin"]): React.CSSProperties | undefined {
  if (!s) return undefined;
  return { marginTop: s.top, marginRight: s.right, marginBottom: s.bottom, marginLeft: s.left };
}

function boxStyleToReact(style?: BoxStyle): React.CSSProperties {
  if (!style) return {};
  return {
    ...spacingStyle(style.padding),
    ...marginStyle(style.margin),
    gap: style.gap,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundGradient ?? (style.backgroundImage ? `url(${style.backgroundImage})` : undefined),
    backgroundSize: style.backgroundImage ? "cover" : undefined,
    backgroundPosition: style.backgroundImage ? "center" : undefined,
    color: style.color,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: style.borderWidth ? "solid" : undefined,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    fontFamily: style.typography?.fontFamily,
    fontSize: style.typography?.fontSize,
    fontWeight: style.typography?.fontWeight,
    lineHeight: style.typography?.lineHeight,
    letterSpacing: style.typography?.letterSpacing,
    textAlign: style.typography?.textAlign,
  };
}

export function ComponentPreview({ component, className }: { component: PageComponent; className?: string }) {
  const style = boxStyleToReact(component.style);

  const inner = (() => {
    switch (component.type) {
      case "heading": {
        const level = (component.props.level as number) ?? 2;
        const Tag = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
        return <Tag className="font-bold">{String(component.props.text ?? "")}</Tag>;
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
        const rows = (component.props.rows as string[][]) ?? [];
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
                      <td key={ci} className="border p-2" dangerouslySetInnerHTML={{ __html: cell }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
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
