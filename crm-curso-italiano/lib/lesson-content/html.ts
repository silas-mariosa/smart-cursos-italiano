import type { CalloutVariant, ContentElement, VocabularyEntry } from "./types";
import { createDefaultElement, generateElementId } from "./catalog";

const CALLOUT_STYLES: Record<CalloutVariant, { bg: string; border: string; label: string }> = {
  tip: { bg: "#eff6ff", border: "#3b82f6", label: "Dica" },
  info: { bg: "#f0fdf4", border: "#22c55e", label: "Informação" },
  warning: { bg: "#fffbeb", border: "#f59e0b", label: "Atenção" },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Conteúdo gerado pelo editor visual — preserva negrito e quebras */
function inlineHtml(text: string): string {
  return text;
}

function serializeCallout(el: Extract<ContentElement, { type: "callout" }>): string {
  const style = CALLOUT_STYLES[el.variant];
  return `<div style="background:${style.bg};border-left:4px solid ${style.border};padding:1rem 1.25rem;border-radius:0.5rem;margin:1rem 0">
<strong>${escapeHtml(el.title || style.label)}</strong>
<p style="margin:0.5rem 0 0">${inlineHtml(el.text)}</p>
</div>`;
}

function serializeVocabulary(el: Extract<ContentElement, { type: "vocabulary" }>): string {
  const rows = el.entries
    .map(
      (e) =>
        `<tr><td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb"><strong>${escapeHtml(e.word)}</strong></td>` +
        `<td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb">${escapeHtml(e.translation)}</td>` +
        `<td style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;color:#6b7280">${escapeHtml(e.note ?? "")}</td></tr>`,
    )
    .join("");
  return `<div style="margin:1rem 0">
<h4 style="margin:0 0 0.5rem;font-size:1rem">${escapeHtml(el.title)}</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.9rem">
<thead><tr style="background:#f9fafb">
<th style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;text-align:left">Italiano</th>
<th style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;text-align:left">Tradução</th>
<th style="padding:0.5rem 0.75rem;border:1px solid #e5e7eb;text-align:left">Nota</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
}

export function serializeElementsToHtml(elements: ContentElement[]): string {
  return elements
    .map((el) => {
      switch (el.type) {
        case "heading":
          return `<h${el.level}>${escapeHtml(el.text)}</h${el.level}>`;
        case "paragraph":
          return `<p>${inlineHtml(el.text)}</p>`;
        case "bullet-list":
          return `<ul>\n${el.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("\n")}\n</ul>`;
        case "numbered-list":
          return `<ol>\n${el.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("\n")}\n</ol>`;
        case "phrase-pair":
          return `<p><strong>${inlineHtml(el.italian)}</strong> — ${inlineHtml(el.translation)}</p>`;
        case "callout":
          return serializeCallout(el);
        case "divider":
          return "<hr />";
        case "image":
          return `<figure style="margin:1rem 0">
<img src="${escapeHtml(el.url)}" alt="${escapeHtml(el.alt)}" style="max-width:100%;border-radius:0.75rem" />
${el.caption ? `<figcaption style="text-align:center;font-size:0.85rem;color:#6b7280;margin-top:0.5rem">${escapeHtml(el.caption)}</figcaption>` : ""}
</figure>`;
        case "vocabulary":
          return serializeVocabulary(el);
      }
    })
    .join("\n");
}

function innerHtml(el: Element): string {
  return el.innerHTML.trim();
}

function parseListItems(listEl: Element): string[] {
  return Array.from(listEl.querySelectorAll(":scope > li")).map((li) => li.innerHTML.trim()).filter(Boolean);
}

function parsePhrasePair(p: Element): ContentElement | null {
  const strong = p.querySelector("strong");
  if (!strong) return null;
  const italian = strong.textContent?.trim() ?? "";
  const rest = (p.textContent ?? "").replace(italian, "").replace(/^[—–-]\s*/, "").trim();
  if (!italian || !rest) return null;
  return { id: generateElementId(), type: "phrase-pair", italian, translation: rest };
}

function parseCallout(div: Element): ContentElement | null {
  const title = div.querySelector("strong")?.textContent?.trim() ?? "Dica";
  const p = div.querySelector("p");
  const text = p?.innerHTML.trim() ?? "";
  let variant: CalloutVariant = "tip";
  const border = div.getAttribute("style") ?? "";
  if (border.includes("#22c55e") || border.includes("green")) variant = "info";
  if (border.includes("#f59e0b") || border.includes("amber")) variant = "warning";
  return { id: generateElementId(), type: "callout", variant, title, text };
}

function parseVocabularyTable(table: HTMLTableElement): ContentElement {
  const title = table.closest("div")?.querySelector("h4")?.textContent?.trim() ?? "Vocabulário";
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  const entries: VocabularyEntry[] = rows.map((row) => {
    const cells = row.querySelectorAll("td");
    return {
      word: cells[0]?.textContent?.trim() ?? "",
      translation: cells[1]?.textContent?.trim() ?? "",
      note: cells[2]?.textContent?.trim() || undefined,
    };
  });
  return { id: generateElementId(), type: "vocabulary", title, entries };
}

function parseNode(node: Element): ContentElement[] {
  const tag = node.tagName.toLowerCase();

  if (tag === "h2") return [{ id: generateElementId(), type: "heading", level: 2, text: node.textContent?.trim() ?? "" }];
  if (tag === "h3" || tag === "h4") return [{ id: generateElementId(), type: "heading", level: 3, text: node.textContent?.trim() ?? "" }];
  if (tag === "hr") return [{ id: generateElementId(), type: "divider" }];
  if (tag === "ul") return [{ id: generateElementId(), type: "bullet-list", items: parseListItems(node) }];
  if (tag === "ol") return [{ id: generateElementId(), type: "numbered-list", items: parseListItems(node) }];
  if (tag === "figure") {
    const img = node.querySelector("img");
    const caption = node.querySelector("figcaption")?.textContent?.trim();
    return [
      {
        id: generateElementId(),
        type: "image",
        url: img?.getAttribute("src") ?? "",
        alt: img?.getAttribute("alt") ?? "",
        caption: caption || undefined,
      },
    ];
  }
  if (tag === "p") {
    const phrase = parsePhrasePair(node);
    if (phrase) return [phrase];
    return [{ id: generateElementId(), type: "paragraph", text: innerHtml(node) }];
  }
  if (tag === "div") {
    if (node.querySelector("table")) {
      const table = node.querySelector("table");
      if (table) return [parseVocabularyTable(table as HTMLTableElement)];
    }
    if (node.querySelector("strong") && node.querySelector("p")) {
      const callout = parseCallout(node);
      if (callout) return [callout];
    }
    return [{ id: generateElementId(), type: "paragraph", text: innerHtml(node) }];
  }

  return [{ id: generateElementId(), type: "paragraph", text: node.textContent?.trim() ?? "" }];
}

export function deserializeHtmlToElements(html: string): ContentElement[] {
  if (!html?.trim()) {
    return [createDefaultElement("heading"), createDefaultElement("paragraph")];
  }

  if (typeof document === "undefined") {
    return [createDefaultElement("paragraph")];
  }

  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return [createDefaultElement("paragraph")];

  const elements: ContentElement[] = [];
  for (const child of Array.from(root.children)) {
    elements.push(...parseNode(child));
  }

  return elements.length > 0 ? elements : [createDefaultElement("paragraph")];
}
