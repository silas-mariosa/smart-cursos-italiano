"use client";

import type { Lesson } from "@lms-mocks/types";
import { resolveLessonDisplay } from "@lms-mocks/lesson-display";
import { LegacyBlockRenderer } from "@/components/lms/legacy-block-renderer";

interface LessonContentPlayerProps {
  lesson: Lesson;
}

export function LessonContentPlayer({ lesson }: LessonContentPlayerProps) {
  const display = resolveLessonDisplay(lesson);

  if (display.mode === "page-builder") {
    return (
      <article
        className="lesson-page-content"
        data-testid="lesson-page-content"
        dangerouslySetInnerHTML={{ __html: display.html }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {display.blocks.map((block) => (
        <LegacyBlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
