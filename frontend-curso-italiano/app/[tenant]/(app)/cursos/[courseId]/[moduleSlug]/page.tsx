"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Menu } from "lucide-react";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { getModuleBySlug } from "@lms-mocks/course-slugs";
import { getStudentLessonHref } from "@lms-mocks/course-routes";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { useStoredStudentProfile } from "@/lib/hooks/useStoredStudentProfile";
import { CourseAccessGate } from "@/components/lms/course-access-gate";
import { CourseSidebar } from "@/components/lms/course-sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function ModuleOverviewPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const courseId = params.courseId as string;
  const moduleSlug = params.moduleSlug as string;
  const { completedLessonIds, getCourseProgress, persona } = useDemoStudent();
  const profile = useStoredStudentProfile(persona?.id);
  const courses = useDemoCourses();
  const course = courses.find((c) => c.id === courseId);
  const module = course ? getModuleBySlug(course, moduleSlug) : undefined;

  if (!profile) return null;
  if (!course || !module) {
    return <div className="p-8 text-center">Módulo não encontrado</div>;
  }

  const progressPercent = getCourseProgress(courseId);
  const firstLesson = module.lessons[0];

  const sidebar = (
    <CourseSidebar
      course={course}
      tenantSlug={tenantSlug}
      courseId={courseId}
      activeModuleSlug={module.slug}
      completedLessonIds={completedLessonIds}
      progressPercent={progressPercent}
    />
  );

  return (
    <CourseAccessGate student={profile} courseId={courseId} tenantSlug={tenantSlug}>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden lg:block w-72 shrink-0">{sidebar}</aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b px-4 py-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="mr-1 size-4" />
                  Conteúdo
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle>Conteúdo do curso</SheetTitle>
                </SheetHeader>
                {sidebar}
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {module.title}
            </p>
            {module.description && (
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{module.description}</p>
            )}
            <p className="mt-6 max-w-md text-muted-foreground">
              Selecione uma aula à esquerda ou abra a primeira aula
            </p>
            {firstLesson && (
              <Link
                href={getStudentLessonHref(tenantSlug, courseId, module.slug, firstLesson.slug)}
                className={cn(buttonVariants(), "mt-6")}
              >
                Abrir primeira aula
              </Link>
            )}
          </div>
        </div>
      </div>
    </CourseAccessGate>
  );
}
