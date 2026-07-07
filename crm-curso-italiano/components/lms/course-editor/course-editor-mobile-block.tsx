import Link from "next/link";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COURSE_EDITOR_MOBILE_DESCRIPTION,
  COURSE_EDITOR_MOBILE_TITLE,
} from "@/lib/course-editor-mobile";

export function CourseEditorMobileBlock({
  backHref = "/dashboard/cursos",
}: {
  backHref?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Monitor className="size-7 text-muted-foreground" />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold">{COURSE_EDITOR_MOBILE_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{COURSE_EDITOR_MOBILE_DESCRIPTION}</p>
      </div>
      <Button asChild>
        <Link href={backHref}>Voltar aos cursos</Link>
      </Button>
    </div>
  );
}
