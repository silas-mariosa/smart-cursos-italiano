"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type LessonPreviewBarProps = {
  editorHref: string;
  lessonTitle: string;
};

export function LessonPreviewBar({ editorHref, lessonTitle }: LessonPreviewBarProps) {
  return (
    <header className="flex items-center gap-2 border-b bg-muted/20 px-3 py-1.5 shrink-0">
      <Link
        href={editorHref}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
      >
        <ArrowLeft className="size-3.5" />
        Voltar ao editor
      </Link>
      <span className="text-muted-foreground/50 text-xs">·</span>
      <span className="text-xs text-muted-foreground truncate min-w-0">
        Pré-visualização — <span className="text-foreground">{lessonTitle}</span>
      </span>
    </header>
  );
}
