"use client";

import { FileText, Headphones, Link2, Video } from "lucide-react";
import type { LessonBlock } from "@lms-mocks/types";

const icons = {
  video: Video,
  text: FileText,
  pdf: FileText,
  audio: Headphones,
  link: Link2,
};

type ContentBlockRendererProps = {
  block: LessonBlock;
};

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  const Icon = icons[block.type as keyof typeof icons] ?? FileText;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        <span className="capitalize">{block.type}</span>
      </div>

      {block.type === "video" && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={(block.content as { url: string }).url}
            title="Vídeo da aula"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}

      {block.type === "text" && (
        <div
          className="prose prose-sm max-w-none rounded-xl bg-card overflow-hidden"
          dangerouslySetInnerHTML={{ __html: (block.content as { html: string }).html }}
        />
      )}

      {block.type === "pdf" && (
        <div className="rounded-xl border bg-card p-6 flex items-center justify-between">
          <div>
            <p className="font-medium">{(block.content as { title: string }).title}</p>
            <p className="text-sm text-muted-foreground">{(block.content as { filename: string }).filename}</p>
          </div>
          <span className="text-sm text-primary">📄 Material de apoio</span>
        </div>
      )}

      {block.type === "audio" && (
        <div className="rounded-xl border bg-card p-6">
          <p className="font-medium mb-3">{(block.content as { title: string }).title}</p>
          <audio controls className="w-full" src={(block.content as { url: string }).url}>
            Seu navegador não suporta áudio.
          </audio>
        </div>
      )}

      {block.type === "link" && (
        <a
          href={(block.content as { url: string }).url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary underline"
        >
          {(block.content as { label: string }).label}
        </a>
      )}
    </div>
  );
}
