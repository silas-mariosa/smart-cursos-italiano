import type { LessonBlock } from "@lms-mocks/types";
import type { SavedLayout } from "@lms-mocks/page-builder-types";
import { LAYOUT_TEMPLATES, cloneLayoutSections } from "@/lib/page-builder/layouts";
import { createEmptyDocument } from "@/lib/page-builder/defaults";
import { normalizeDocument } from "@/lib/page-builder/document";
import { pageDocumentToLessonBlocks } from "@/lib/page-builder/migrate";

/** Layouts sugeridos ao criar uma nova aula */
export const NEW_LESSON_LAYOUT_IDS = [
  "layout-video-aula",
  "layout-video-vocabulario",
  "layout-introducao",
  "layout-gramatica",
  "layout-vocab-dialogo",
  "layout-exercicios",
  "layout-cultura",
  "layout-revisao-quiz",
  "layout-conversacao",
] as const;

export function getNewLessonLayoutOptions(): SavedLayout[] {
  return NEW_LESSON_LAYOUT_IDS.map((id) => LAYOUT_TEMPLATES.find((l) => l.id === id)).filter(
    (l): l is SavedLayout => !!l,
  );
}

export function layoutTemplateToBlocks(layoutId: string): LessonBlock[] {
  const layout = LAYOUT_TEMPLATES.find((l) => l.id === layoutId);
  if (!layout) return [];

  const doc = normalizeDocument({
    ...createEmptyDocument(),
    sections: cloneLayoutSections(layout),
  });

  return pageDocumentToLessonBlocks(doc);
}
