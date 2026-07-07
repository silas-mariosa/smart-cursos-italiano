"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMockStore } from "@/lib/mock-store";
import { countLessons } from "@lms-mocks/courses";
import { getCrmDefaultLessonHref, getCrmCoursePreviewHref, getCrmCourseMetricsHref } from "@lms-mocks/course-routes";
import { getCourseAnalytics } from "@/lib/course-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function CoursesListPage() {
  const { courses, updateCourse, students, grades } = useMockStore();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = courses.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleCreateCourse() {
    if (!newTitle.trim()) return;
    const newCourse = {
      id: `course-${Date.now()}`,
      tenantId: "tenant-studio-italiano",
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/\s+/g, "-"),
      description: "Novo curso",
      level: "A1" as const,
      status: "draft" as const,
      thumbnailUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=240&fit=crop",
      instructorName: "Prof. Marco Rossi",
      modules: [],
    };
    updateCourse(newCourse);
    setNewTitle("");
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Meus cursos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button">+ Criar curso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo curso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Italiano B1" />
              </div>
              <Button onClick={handleCreateCourse} disabled={!newTitle.trim()}>
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        {(["all", "published", "draft"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "Todos" : f === "published" ? "Publicado" : "Rascunho"}
          </Button>
        ))}
        <Input
          className="max-w-xs ml-auto"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filtered.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardContent className="p-0 flex flex-col sm:flex-row">
              <div className="relative h-32 sm:h-auto sm:w-48 bg-muted shrink-0">
                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
              </div>
              <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{course.level}</Badge>
                    <Badge variant={course.status === "published" ? "success" : "secondary"}>
                      {course.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {countLessons(course)} aulas ·{" "}
                    {course.status === "published"
                      ? `${getCourseAnalytics(course, students, grades).enrolledCount} alunos`
                      : "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={getCrmDefaultLessonHref(course)}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <Link href={getCrmCoursePreviewHref(course.id)}>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </Link>
                  <Link href={getCrmCourseMetricsHref(course.id)}>
                    <Button variant="ghost" size="sm">
                      Alunos e métricas
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
