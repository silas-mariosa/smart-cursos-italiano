import type { Lesson, LessonBlock, TextBlockContent } from "./types";
import type { PageDocument } from "./page-builder-types";
import { renderPageDocumentToHtml } from "./page-builder-html";

export type LessonDisplayMode = "page-builder" | "legacy-blocks";

export type LessonDisplayContent =
  | { mode: "page-builder"; html: string; pageDocument: PageDocument | null }
  | { mode: "legacy-blocks"; blocks: LessonBlock[] };

function getTextBlockContent(block: LessonBlock): TextBlockContent | null {
  if (block.type !== "text") return null;
  return block.content as TextBlockContent;
}

/** Conteúdo da aula pronto para exibição ao aluno */
export function resolveLessonDisplay(lesson: Pick<Lesson, "blocks">): LessonDisplayContent {
  const blocks = lesson.blocks.filter((b) => b.type !== "exercise").sort((a, b) => a.order - b.order);
  const textBlock = blocks.find((b) => b.type === "text");
  const textContent = textBlock ? getTextBlockContent(textBlock) : null;
  const pageDocument = textContent?.pageDocument;

  if (pageDocument?.version === 1) {
    return {
      mode: "page-builder",
      html: renderPageDocumentToHtml(pageDocument),
      pageDocument,
    };
  }

  if (textContent?.html?.trim() && blocks.length === 1 && textBlock?.type === "text") {
    return {
      mode: "page-builder",
      html: textContent.html,
      pageDocument: null,
    };
  }

  return { mode: "legacy-blocks", blocks };
}

export function isPageBuilderLesson(lesson: Pick<Lesson, "blocks">): boolean {
  return resolveLessonDisplay(lesson).mode === "page-builder";
}
