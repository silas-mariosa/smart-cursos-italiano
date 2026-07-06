"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock-store";
import { getLessonPreviewHrefFromLessonId, getLessonEditorHrefFromLessonId } from "@/lib/editor-routes";

function useLegacyLessonRedirect(mode: "conteudo" | "praticar", preview: boolean) {
  const params = useParams();
  const router = useRouter();
  const { courses } = useMockStore();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    const resolver = preview ? getLessonPreviewHrefFromLessonId : getLessonEditorHrefFromLessonId;
    const href =
      resolver(courses, courseId, lessonId, mode) ?? `/dashboard/cursos/${courseId}`;
    router.replace(href);
  }, [courses, courseId, lessonId, mode, preview, router]);
}

export function LegacyLessonRedirect({
  mode = "conteudo",
  preview = false,
}: {
  mode?: "conteudo" | "praticar";
  preview?: boolean;
}) {
  useLegacyLessonRedirect(mode, preview);
  return <div className="p-8 text-muted-foreground">Redirecionando...</div>;
}

export function LegacyLessonPathRedirect() {
  const pathname = usePathname();
  const isPractice = pathname.includes("/praticar");
  const isPreview = pathname.includes("pre-visualizar");
  return <LegacyLessonRedirect mode={isPractice ? "praticar" : "conteudo"} preview={isPreview} />;
}
