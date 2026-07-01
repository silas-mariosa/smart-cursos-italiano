"use client";

import { FileText, Headphones, Link2 } from "lucide-react";
import type { LessonBlock } from "@lms-mocks/types";

type LegacyBlockRendererProps = {
  block: LessonBlock;
};

/** Renderiza blocos legados (pré page builder) sem rótulos técnicos de editor */
export function LegacyBlockRenderer({ block }: LegacyBlockRendererProps) {
  switch (block.type) {
    case "video":
      return (
        <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-md">
          <iframe
            src={(block.content as { url: string }).url}
            title="Vídeo da aula"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );

    case "text":
      return (
        <div
          className="lesson-page-content lesson-page-content--legacy"
          dangerouslySetInnerHTML={{ __html: (block.content as { html: string }).html }}
        />
      );

    case "pdf":
      return (
        <div className="rounded-xl border bg-card p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{(block.content as { title: string }).title}</p>
              <p className="text-sm text-muted-foreground">{(block.content as { filename: string }).filename}</p>
            </div>
          </div>
          <span className="text-sm font-medium text-primary shrink-0">Baixar PDF</span>
        </div>
      );

    case "audio":
      return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="size-4 text-primary" />
            <p className="font-medium">{(block.content as { title: string }).title}</p>
          </div>
          <audio controls className="w-full" src={(block.content as { url: string }).url}>
            Seu navegador não suporta áudio.
          </audio>
        </div>
      );

    case "link":
      return (
        <a
          href={(block.content as { url: string }).url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-primary font-medium hover:bg-accent transition-colors"
        >
          <Link2 className="size-4" />
          {(block.content as { label: string }).label}
        </a>
      );

    default:
      return null;
  }
}
