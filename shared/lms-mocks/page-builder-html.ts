import type { BoxStyle, PageComponent, PageDocument, PageSection, Spacing, TableCellData, Typography } from "./page-builder-types";
import { headingTag, headingTypographyStyle, normalizeHeadingLevel } from "./heading-styles";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function spacingCss(s?: Spacing): string {
  if (!s) return "";
  const t = s.top ?? 0;
  const r = s.right ?? 0;
  const b = s.bottom ?? 0;
  const l = s.left ?? 0;
  if (t === r && r === b && b === l) return t ? `${t}px` : "";
  return `${t}px ${r}px ${b}px ${l}px`;
}

function typographyCss(t?: Typography): string {
  if (!t) return "";
  const parts: string[] = [];
  if (t.fontFamily) parts.push(`font-family:${t.fontFamily}`);
  if (t.fontSize) parts.push(`font-size:${t.fontSize}px`);
  if (t.fontWeight) parts.push(`font-weight:${t.fontWeight}`);
  if (t.lineHeight) parts.push(`line-height:${t.lineHeight}`);
  if (t.letterSpacing) parts.push(`letter-spacing:${t.letterSpacing}px`);
  if (t.textAlign) parts.push(`text-align:${t.textAlign}`);
  return parts.join(";");
}

function maxWidthCss(v?: BoxStyle["maxWidth"]): string {
  if (!v || v === "full") return "max-width:100%";
  if (v === "narrow") return "max-width:640px";
  if (v === "wide") return "max-width:960px";
  if (v === "prose") return "max-width:720px";
  return `max-width:${v}px`;
}

export function boxStyleToCss(style?: BoxStyle): string {
  if (!style) return "";
  const parts: string[] = [];
  const pad = spacingCss(style.padding);
  const mar = spacingCss(style.margin);
  if (pad) parts.push(`padding:${pad}`);
  if (mar) parts.push(`margin:${mar}`);
  if (style.gap != null) parts.push(`gap:${style.gap}px`);
  if (style.backgroundColor) parts.push(`background-color:${style.backgroundColor}`);
  if (style.backgroundGradient) parts.push(`background:${style.backgroundGradient}`);
  else if (style.backgroundImage) {
    parts.push(`background-image:url(${style.backgroundImage})`);
    parts.push("background-size:cover;background-position:center");
  }
  if (style.backgroundOverlay) parts.push(`box-shadow:inset 0 0 0 9999px ${style.backgroundOverlay}`);
  if (style.color) parts.push(`color:${style.color}`);
  if (style.borderColor) parts.push(`border-color:${style.borderColor}`);
  if (style.borderWidth != null) parts.push(`border-width:${style.borderWidth}px`, "border-style:solid");
  if (style.borderRadius != null) parts.push(`border-radius:${style.borderRadius}px`);
  if (style.boxShadow) parts.push(`box-shadow:${style.boxShadow}`);
  const typo = typographyCss(style.typography);
  if (typo) parts.push(typo);
  return parts.join(";");
}

function wrapAlign(content: string, style?: BoxStyle): string {
  const mw = maxWidthCss(style?.maxWidth);
  const align = style?.align ?? "left";
  const margin =
    align === "center" ? "margin-left:auto;margin-right:auto" : align === "right" ? "margin-left:auto" : "";
  return `<div style="${mw};${margin}">${content}</div>`;
}

function inlineText(text: string): string {
  return text;
}

function normalizeTableRows(raw: unknown): TableCellData[][] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    if (!Array.isArray(row)) return [{ content: "" }];
    return row.map((cell) => (typeof cell === "string" ? { content: cell } : (cell as TableCellData)));
  });
}

const ICON_EMOJI: Record<string, string> = {
  "volume-2": "🔊",
  "alert-triangle": "⚠️",
  lightbulb: "💡",
  "book-open": "📖",
  "message-square": "💬",
  "help-circle": "❓",
  star: "⭐",
};

function renderComponent(c: PageComponent): string {
  const style = boxStyleToCss(c.style);
  const wrap = (inner: string) =>
    style ? `<div data-pb-component="${c.type}" style="${style}">${inner}</div>` : `<div data-pb-component="${c.type}">${inner}</div>`;

  switch (c.type) {
    case "heading": {
      const level = normalizeHeadingLevel(c.props.level);
      const tag = headingTag(level);
      const hs = headingTypographyStyle(level, c.style?.typography);
      const headingCss = `font-size:${hs.fontSize}px;font-weight:${hs.fontWeight};line-height:${hs.lineHeight};margin:0`;
      const color = c.style?.color ? `color:${c.style.color};` : "";
      return wrap(`<${tag} style="${headingCss};${color}">${escapeHtml(String(c.props.text ?? ""))}</${tag}>`);
    }
    case "paragraph":
      return wrap(`<p>${inlineText(String(c.props.text ?? ""))}</p>`);
    case "image": {
      const src = escapeHtml(String(c.props.src ?? ""));
      const alt = escapeHtml(String(c.props.alt ?? ""));
      const cap = c.props.caption ? `<figcaption>${escapeHtml(String(c.props.caption))}</figcaption>` : "";
      return wrap(`<figure><img src="${src}" alt="${alt}" style="max-width:100%;border-radius:8px" />${cap}</figure>`);
    }
    case "video":
    case "embed": {
      const url = escapeHtml(String(c.props.url ?? ""));
      return wrap(
        `<div style="aspect-ratio:16/9;border-radius:12px;overflow:hidden"><iframe src="${url}" style="width:100%;height:100%;border:0" allowfullscreen></iframe></div>`,
      );
    }
    case "button": {
      const label = escapeHtml(String(c.props.label ?? "Botão"));
      const url = escapeHtml(String(c.props.url ?? "#"));
      const variant = c.props.variant === "outline" ? "outline" : "solid";
      const bg = variant === "outline" ? "background:transparent;border:2px solid #2563eb;color:#2563eb" : "background:#2563eb;color:#fff;border:none";
      return wrap(
        `<a href="${url}" style="display:inline-block;padding:0.625rem 1.25rem;border-radius:8px;text-decoration:none;font-weight:600;${bg}">${label}</a>`,
      );
    }
    case "card": {
      const title = escapeHtml(String(c.props.title ?? ""));
      const desc = inlineText(String(c.props.description ?? ""));
      const img = c.props.imageUrl
        ? `<img src="${escapeHtml(String(c.props.imageUrl))}" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:8px 8px 0 0;margin:-1rem -1rem 1rem" />`
        : "";
      return wrap(
        `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:1rem;background:#fff">${img}<strong>${title}</strong><p style="margin:0.5rem 0 0;color:#6b7280">${desc}</p></div>`,
      );
    }
    case "alert":
    case "callout": {
      const variant = String(c.props.variant ?? "info");
      const colors: Record<string, { bg: string; border: string }> = {
        info: { bg: "#eff6ff", border: "#3b82f6" },
        tip: { bg: "#f0fdf4", border: "#22c55e" },
        warning: { bg: "#fffbeb", border: "#f59e0b" },
        error: { bg: "#fef2f2", border: "#ef4444" },
      };
      const c2 = colors[variant] ?? colors.info;
      return wrap(
        `<div style="background:${c2.bg};border-left:4px solid ${c2.border};padding:1rem 1.25rem;border-radius:8px"><strong>${escapeHtml(String(c.props.title ?? ""))}</strong><p style="margin:0.5rem 0 0">${inlineText(String(c.props.text ?? ""))}</p></div>`,
      );
    }
    case "list": {
      const items = (c.props.items as string[]) ?? [];
      const tag = c.props.ordered ? "ol" : "ul";
      return wrap(`<${tag}>${items.map((i) => `<li>${inlineText(i)}</li>`).join("")}</${tag}>`);
    }
    case "table": {
      const headers = (c.props.headers as string[]) ?? [];
      const rows = normalizeTableRows(c.props.rows);
      const th = headers.map((h) => `<th style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;text-align:center">${escapeHtml(h)}</th>`).join("");
      const tr = rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => {
                const attrs = [
                  cell.rowspan ? `rowspan="${cell.rowspan}"` : "",
                  cell.colspan ? `colspan="${cell.colspan}"` : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return `<td style="padding:8px;border:1px solid #e5e7eb;text-align:center"${attrs ? ` ${attrs}` : ""}>${inlineText(cell.content)}</td>`;
              })
              .join("")}</tr>`,
        )
        .join("");
      return wrap(
        `<table style="width:100%;border-collapse:collapse;font-size:0.9rem"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`,
      );
    }
    case "icon-badge": {
      const emoji = ICON_EMOJI[String(c.props.icon ?? "volume-2")] ?? "📌";
      const variant = String(c.props.variant ?? "info");
      const bg: Record<string, string> = { info: "#2563eb", warning: "#f59e0b", tip: "#059669" };
      const side = c.props.content
        ? `<div style="border-left:2px solid #bfdbfe;padding-left:12px;font-size:0.875rem;color:#6b7280;flex:1">${inlineText(String(c.props.content))}</div>`
        : "";
      return wrap(
        `<div style="display:flex;gap:12px;align-items:flex-start"><div style="text-align:center;width:64px;flex-shrink:0"><div style="width:40px;height:40px;border-radius:8px;background:${bg[variant] ?? bg.info};display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:1.25rem">${emoji}</div><p style="font-size:0.75rem;font-weight:600;color:#1d4ed8;margin:4px 0 0">${escapeHtml(String(c.props.label ?? ""))}${c.props.subtitle ? ` <span style="color:#93c5fd">${escapeHtml(String(c.props.subtitle))}</span>` : ""}</p></div>${side}</div>`,
      );
    }
    case "example-grid": {
      const cols = Number(c.props.columns ?? 2);
      const items = (c.props.items as { left: string; right?: string }[]) ?? [];
      const gridCols = cols === 1 ? "1fr" : cols === 3 ? "repeat(3,1fr)" : "repeat(2,1fr)";
      return wrap(
        `<div style="display:grid;grid-template-columns:${gridCols};gap:8px">${items
          .map(
            (item) =>
              `<div style="background:#eff6ff;border-radius:8px;padding:8px 12px;font-size:0.875rem">${inlineText(item.left)}${item.right ? ` <span style="color:#6b7280;font-style:italic">${inlineText(item.right)}</span>` : ""}</div>`,
          )
          .join("")}</div>`,
      );
    }
    case "dialogue-box": {
      const lines = (c.props.lines as { speaker: string; text: string }[]) ?? [];
      const ctx = c.props.context ? `<p style="font-size:0.875rem;color:#6b7280;font-style:italic;margin:0 0 8px">${inlineText(String(c.props.context))}</p>` : "";
      const inner = lines.map((l) => `<p style="margin:0 0 6px;font-size:0.875rem"><strong>${escapeHtml(l.speaker)}:</strong> ${escapeHtml(l.text)}</p>`).join("");
      return wrap(`<div>${ctx}<div style="background:#eff6ff;border-radius:12px;padding:16px">${inner}</div></div>`);
    }
    case "vocabulary-box": {
      const pairs = (c.props.pairs as { term: string; translation: string }[]) ?? [];
      const bg = escapeHtml(String(c.props.backgroundColor ?? "#6b21a8"));
      const rows = pairs
        .map(
          (p) =>
            `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.875rem;margin-bottom:4px"><span style="font-weight:500">${escapeHtml(p.term)}</span><span style="opacity:0.75">${escapeHtml(p.translation)}</span></div>`,
        )
        .join("");
      return wrap(
        `<div style="background:${bg};color:#fff;border-radius:12px;padding:16px"><p style="font-weight:700;font-size:0.875rem;margin:0 0 12px">${escapeHtml(String(c.props.title ?? "Vocabulário"))}</p>${rows}</div>`,
      );
    }
    case "writing-lines": {
      const lineCount = Number(c.props.lineCount ?? 2);
      const prompt = c.props.prompt ? `<p style="font-size:0.875rem;font-weight:500;margin:0 0 8px">${inlineText(String(c.props.prompt))}</p>` : "";
      const lines = Array.from({ length: lineCount })
        .map(() => `<div style="border-bottom:1px dashed #9ca3af;height:32px;margin-bottom:4px"></div>`)
        .join("");
      return wrap(`${prompt}${lines}`);
    }
    case "infobox": {
      const sections = (c.props.sections as { subtitle: string; rows: { left: string; right: string }[] }[]) ?? [];
      const body = sections
        .map(
          (sec) =>
            `<div style="margin-bottom:12px">${sec.subtitle ? `<p style="font-size:0.75rem;font-weight:600;color:#6b21a8;margin:0 0 4px">${escapeHtml(sec.subtitle)}</p>` : ""}${sec.rows.map((r) => `<div style="display:grid;grid-template-columns:1fr 1fr;font-size:0.875rem;padding:2px 0"><span>${escapeHtml(r.left)}</span><span style="text-align:right;color:#6b7280">${escapeHtml(r.right)}</span></div>`).join("")}</div>`,
        )
        .join("");
      return wrap(
        `<div style="border:2px solid #6b21a8;border-radius:8px;overflow:hidden"><div style="background:#6b21a8;color:#fff;padding:6px 12px;font-weight:600;font-size:0.875rem">${escapeHtml(String(c.props.title ?? "Infobox"))}</div><div style="padding:12px">${body}</div></div>`,
      );
    }
    case "activity": {
      const title = c.props.title ? `<p style="font-weight:600;color:#2563eb;margin:0 0 4px">${escapeHtml(String(c.props.title))}</p>` : "";
      const instr = c.props.instructions ? `<p style="font-size:0.875rem;color:#6b7280;margin:0 0 12px">${escapeHtml(String(c.props.instructions))}</p>` : "";
      const source = String(c.props.source ?? "bank");
      let body = "";
      if (source === "bank" && c.props.exerciseId) {
        body = `<p style="font-size:0.875rem">[Exercício: ${escapeHtml(String(c.props.exerciseId))}]</p>`;
      } else if (source === "manual" && c.props.manualTitle) {
        body = `<p style="font-size:0.875rem;font-weight:500">${escapeHtml(String(c.props.manualTitle))}</p>`;
      } else {
        body = `<p style="font-size:0.875rem;color:#6b7280;font-style:italic">Atividade interativa</p>`;
      }
      return wrap(
        `<div style="border:2px dashed #93c5fd;border-radius:12px;padding:16px;background:#eff6ff">${title}${instr}${body}</div>`,
      );
    }
    case "separator":
    case "divider":
      return wrap('<hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0" />');
    case "accordion": {
      const items = (c.props.items as { title: string; content: string }[]) ?? [];
      return wrap(
        `<div>${items
          .map(
            (item, i) =>
              `<details style="border:1px solid #e5e7eb;border-radius:8px;padding:0.75rem 1rem;margin-bottom:0.5rem"${i === 0 ? " open" : ""}><summary style="font-weight:600;cursor:pointer">${escapeHtml(item.title)}</summary><p style="margin:0.75rem 0 0;color:#6b7280">${inlineText(item.content)}</p></details>`,
          )
          .join("")}</div>`,
      );
    }
    case "tabs": {
      const items = (c.props.items as { label: string; content: string }[]) ?? [];
      return wrap(
        `<div>${items
          .map(
            (item, i) =>
              `<div style="margin-bottom:1rem"><div style="font-weight:600;color:#2563eb;margin-bottom:0.5rem">${escapeHtml(item.label)}</div><div>${inlineText(item.content)}</div></div>`,
          )
          .join("")}</div>`,
      );
    }
    case "quote":
      return wrap(
        `<blockquote style="border-left:4px solid #d1d5db;padding-left:1rem;font-style:italic;color:#4b5563"><p>${inlineText(String(c.props.text ?? ""))}</p>${c.props.author ? `<cite style="display:block;margin-top:0.5rem;font-size:0.875rem">— ${escapeHtml(String(c.props.author))}</cite>` : ""}</blockquote>`,
      );
    case "cta": {
      const title = escapeHtml(String(c.props.title ?? ""));
      const desc = inlineText(String(c.props.description ?? ""));
      const btn = escapeHtml(String(c.props.buttonLabel ?? "Saiba mais"));
      const url = escapeHtml(String(c.props.buttonUrl ?? "#"));
      return wrap(
        `<div style="text-align:center;padding:2rem;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-radius:16px"><h3 style="margin:0 0 0.5rem">${title}</h3><p style="color:#6b7280;margin:0 0 1.25rem">${desc}</p><a href="${url}" style="display:inline-block;padding:0.75rem 1.5rem;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${btn}</a></div>`,
      );
    }
    case "card-grid": {
      const cards = (c.props.cards as { title: string; description: string; imageUrl?: string }[]) ?? [];
      return wrap(
        `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">${cards
          .map(
            (card) =>
              `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:1rem;background:#fff">${card.imageUrl ? `<img src="${escapeHtml(card.imageUrl)}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:0.75rem" />` : ""}<strong>${escapeHtml(card.title)}</strong><p style="margin:0.5rem 0 0;font-size:0.875rem;color:#6b7280">${escapeHtml(card.description)}</p></div>`,
          )
          .join("")}</div>`,
      );
    }
    case "spacer":
      return `<div style="height:${Number(c.props.height ?? 32)}px" aria-hidden="true"></div>`;
    case "code":
      return wrap(
        `<pre style="background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:8px;overflow-x:auto;font-size:0.875rem"><code>${escapeHtml(String(c.props.code ?? ""))}</code></pre>`,
      );
    case "file-download": {
      const title = escapeHtml(String(c.props.title ?? "Download"));
      const filename = escapeHtml(String(c.props.filename ?? "arquivo.pdf"));
      const url = escapeHtml(String(c.props.url ?? "#"));
      return wrap(
        `<a href="${url}" style="display:flex;align-items:center;justify-content:space-between;padding:1rem;border:1px solid #e5e7eb;border-radius:12px;text-decoration:none;color:inherit;background:#f9fafb"><span><strong>${title}</strong><br/><span style="font-size:0.875rem;color:#6b7280">${filename}</span></span><span>📥</span></a>`,
      );
    }
    default:
      return wrap(`<p>${escapeHtml(c.type)}</p>`);
  }
}

function renderColumn(
  col: import("./page-builder-types").PageColumn,
  columnCount: number,
  layoutDirection: PageSection["layoutDirection"],
): string {
  const colStyle = boxStyleToCss(col.style);
  const isSideBySide = columnCount > 1 && layoutDirection !== "rows";
  const flex = isSideBySide ? `flex:1;min-width:0` : "width:100%";
  const rows = col.rows?.length
    ? col.rows
    : [{ id: "legacy", components: col.components ?? [] }];
  const rowGap = col.style?.gap ?? 12;
  const rowsHtml = rows
    .map((row) => {
      const rowStyle = boxStyleToCss(row.style);
      const inner = row.components.map(renderComponent).join("\n");
      return `<div data-pb-row style="display:flex;flex-direction:column;gap:8px;${rowStyle}">${inner || "&nbsp;"}</div>`;
    })
    .join("");
  const inner = `<div data-pb-column-rows style="display:flex;flex-direction:column;gap:${rowGap}px">${rowsHtml}</div>`;
  return `<div data-pb-column style="${flex};${colStyle}">${inner}</div>`;
}

function renderSection(section: PageSection): string {
  const sectionStyle = boxStyleToCss(section.style);
  const layoutDirection = section.layoutDirection ?? "columns";
  const cols = section.columns.map((col) => renderColumn(col, section.columnCount, layoutDirection)).join("");
  const gap = section.style?.gap ?? 16;
  const grid =
    section.columnCount > 1
      ? layoutDirection === "rows"
        ? `display:flex;flex-direction:column;gap:${gap}px`
        : `display:flex;flex-wrap:wrap;gap:${gap}px`
      : "display:block";
  const inner = `<div style="${grid}">${cols}</div>`;
  return `<section data-pb-section="${escapeHtml(section.label)}" style="${sectionStyle};${grid.includes("gap") ? "" : ""}">${wrapAlign(inner, section.style)}</section>`;
}

export function renderPageDocumentToHtml(doc: PageDocument): string {
  return doc.sections.map(renderSection).join("\n");
}
