import type { LessonBlock } from "@lms-mocks/types";
import type { PageDocument } from "@lms-mocks/page-builder-types";
import { renderPageDocumentToHtml } from "@lms-mocks/page-builder-html";
import { createComponent, createEmptyDocument, createRow, createSection, pbId } from "./defaults";

/** Converte blocos legados da aula em um PageDocument */
export function lessonBlocksToPageDocument(blocks: LessonBlock[]): PageDocument {
  const textBlock = blocks.find((b) => b.type === "text");
  const pageDoc = (textBlock?.content as { pageDocument?: PageDocument })?.pageDocument;
  if (pageDoc?.version === 1) return pageDoc;

  const doc = createEmptyDocument();
  doc.sections = [];

  for (const block of blocks.sort((a, b) => a.order - b.order)) {
    if (block.type === "text") {
      const html = (block.content as { html: string }).html;
      if (html?.trim()) {
        doc.sections.push(htmlToSection(html));
      }
    } else if (block.type === "video") {
      const c = block.content as { url: string };
      doc.sections.push({
        id: pbId("sec"),
        label: "Vídeo",
        columnCount: 1,
        columns: [{ id: pbId("col"), span: 12, rowCount: 1, rows: [createRow([{ ...createComponent("video"), props: { url: c.url } }])] }],
      });
    } else if (block.type === "pdf") {
      const c = block.content as { title: string; filename: string };
      doc.sections.push({
        id: pbId("sec"),
        label: "Material PDF",
        columnCount: 1,
        columns: [
          {
            id: pbId("col"),
            span: 12,
            rowCount: 1,
            rows: [createRow([{ ...createComponent("file-download"), props: { title: c.title, filename: c.filename, url: "#" } }])],
          },
        ],
      });
    } else if (block.type === "audio") {
      const c = block.content as { url: string; title: string };
      doc.sections.push({
        id: pbId("sec"),
        label: "Áudio",
        columnCount: 1,
        columns: [
          {
            id: pbId("col"),
            span: 12,
            rowCount: 1,
            rows: [createRow([{ ...createComponent("embed"), props: { url: c.url, embedType: "audio", title: c.title } }])],
          },
        ],
      });
    } else if (block.type === "link") {
      const c = block.content as { url: string; label: string };
      doc.sections.push({
        id: pbId("sec"),
        label: "Link",
        columnCount: 1,
        columns: [
          {
            id: pbId("col"),
            span: 12,
            rowCount: 1,
            rows: [createRow([{ ...createComponent("button"), props: { label: c.label, url: c.url } }])],
          },
        ],
      });
    }
  }

  if (doc.sections.length === 0) {
    doc.sections = createEmptyDocument().sections;
  }

  return doc;
}

function htmlToSection(html: string): PageDocument["sections"][0] {
  if (typeof document === "undefined") {
    return createSection("Conteúdo importado", 1);
  }
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root");
  const components = [];
  if (root) {
    for (const child of Array.from(root.children)) {
      const tag = child.tagName.toLowerCase();
      if (tag === "h2" || tag === "h3" || tag === "h4") {
        components.push({
          ...createComponent("heading"),
          props: { text: child.textContent ?? "", level: tag === "h2" ? 2 : 3 },
        });
      } else if (tag === "ul" || tag === "ol") {
        components.push({
          ...createComponent("list"),
          props: {
            ordered: tag === "ol",
            items: Array.from(child.querySelectorAll("li")).map((li) => li.innerHTML),
          },
        });
      } else if (tag === "p") {
        components.push({ ...createComponent("paragraph"), props: { text: child.innerHTML } });
      } else if (tag === "hr") {
        components.push(createComponent("separator"));
      } else if (tag === "figure") {
        const img = child.querySelector("img");
        components.push({
          ...createComponent("image"),
          props: {
            src: img?.getAttribute("src") ?? "",
            alt: img?.getAttribute("alt") ?? "",
            caption: child.querySelector("figcaption")?.textContent ?? "",
          },
        });
      } else {
        components.push({ ...createComponent("paragraph"), props: { text: child.innerHTML || child.textContent || "" } });
      }
    }
  }
  const section = createSection("Conteúdo importado", 1);
  section.columns[0].rows[0].components = components.length ? components : [createComponent("paragraph")];
  return section;
}

/** Persiste PageDocument como bloco único de texto + HTML para o player */
export function pageDocumentToLessonBlocks(doc: PageDocument): LessonBlock[] {
  const html = renderPageDocumentToHtml(doc);
  return [
    {
      id: `block-page-${Date.now()}`,
      type: "text",
      order: 1,
      content: { html, pageDocument: doc },
    },
  ];
}

export function getPageDocumentFromBlocks(blocks: LessonBlock[]): PageDocument {
  const text = blocks.find((b) => b.type === "text");
  const pageDoc = (text?.content as { pageDocument?: PageDocument })?.pageDocument;
  if (pageDoc?.version === 1) return pageDoc;
  return lessonBlocksToPageDocument(blocks);
}
