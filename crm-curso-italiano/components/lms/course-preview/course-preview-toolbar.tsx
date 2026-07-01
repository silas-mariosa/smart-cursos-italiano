"use client";

import Link from "next/link";
import { Eye, Pencil, Users } from "lucide-react";
import type { Course } from "@lms-mocks/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CoursePreviewToolbarProps {
  course: Course;
  activeTab: "conteudo" | "alunos";
  onTabChange: (tab: "conteudo" | "alunos") => void;
  className?: string;
}

export function CoursePreviewToolbar({ course, activeTab, onTabChange, className }: CoursePreviewToolbarProps) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/dashboard/cursos/${course.id}`}>
            <Button variant="ghost" size="sm" className="shrink-0">
              <Pencil className="size-4 mr-1" />
              Editar
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Eye className="size-3" />
                Modo visualização
              </Badge>
              <Badge variant={course.status === "published" ? "success" : "secondary"}>
                {course.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate mt-0.5">{course.title}</p>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "conteudo" | "alunos")}>
          <TabsList>
            <TabsTrigger value="conteudo" className="gap-1.5">
              <Eye className="size-3.5" />
              Visão do aluno
            </TabsTrigger>
            <TabsTrigger value="alunos" className="gap-1.5">
              <Users className="size-3.5" />
              Alunos e métricas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
