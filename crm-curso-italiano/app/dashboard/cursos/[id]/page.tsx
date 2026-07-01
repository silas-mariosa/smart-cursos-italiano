"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, CheckCircle2, Circle, Eye } from "lucide-react";
import { useMockStore, getCourseFromStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { courses, addModule, addLesson } = useMockStore();
  const course = getCourseFromStore(courses, courseId);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (!course) {
    return <div>Curso não encontrado</div>;
  }

  const firstLesson = course.modules[0]?.lessons[0]?.id;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 border rounded-xl overflow-hidden">
      <aside className="w-72 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/dashboard/cursos" className="text-xs text-primary hover:underline">
            ← Cursos
          </Link>
          <h2 className="font-semibold mt-2 line-clamp-2">{course.title}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge>{course.status === "published" ? "Publicado" : "Rascunho"}</Badge>
            <Link href={`/dashboard/cursos/${courseId}/visualizar`}>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Eye className="size-3 mr-1" />
                Visualizar
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">{mod.title}</p>
              <ul className="mt-1 space-y-0.5">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/dashboard/cursos/${courseId}/aulas/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent",
                        selectedLessonId === lesson.id && "bg-accent",
                      )}
                      onClick={() => setSelectedLessonId(lesson.id)}
                    >
                      {lesson.status === "published" ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="size-3.5 opacity-40" />
                      )}
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-xs"
                onClick={() => {
                  const title = prompt("Nome da nova aula:");
                  if (title) addLesson(courseId, mod.id, title);
                }}
              >
                <Plus className="size-3 mr-1" /> Nova aula
              </Button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t space-y-2">
          <Input
            placeholder="Novo módulo..."
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newModuleTitle.trim()) {
                addModule(courseId, newModuleTitle.trim());
                setNewModuleTitle("");
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              if (newModuleTitle.trim()) {
                addModule(courseId, newModuleTitle.trim());
                setNewModuleTitle("");
              }
            }}
          >
            <Plus className="size-3 mr-1" /> Módulo
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
        {firstLesson ? (
          <div>
            <p className="mb-4">Selecione uma aula à esquerda ou abra a primeira aula</p>
            <Link href={`/dashboard/cursos/${courseId}/aulas/${firstLesson}`}>
              <Button>Abrir editor de aula</Button>
            </Link>
          </div>
        ) : (
          <p>Adicione um módulo e uma aula para começar</p>
        )}
      </div>
    </div>
  );
}
