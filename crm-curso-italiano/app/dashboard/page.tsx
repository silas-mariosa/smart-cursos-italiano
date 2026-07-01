"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { countLessons } from "@lms-mocks/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function DashboardPage() {
  const { persona, courses, attempts, students, activity, liveSessions } = useMockStore();
  const pendingCount = attempts.filter((a) => a.status === "pending").length;
  const publishedCourses = courses.filter((c) => c.status === "published");
  const activeLive = liveSessions.find((s) => s.status === "waiting" || s.status === "live");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bom dia, {persona?.name?.split(" ").slice(-1)[0]}!</h1>
        <p className="text-muted-foreground">Aqui está o resumo da sua escola hoje</p>
      </div>

      {activeLive && (
        <Card className="border-red-300 bg-red-50/80 overflow-hidden">
          <CardContent className="py-0 p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-red-600 text-white px-6 py-4 sm:py-6 flex items-center justify-center sm:w-32 shrink-0">
                <Video className="size-10" />
              </div>
              <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-red-600 text-white border-0 mb-2">
                    {activeLive.status === "live" ? "Aula ao vivo" : "Alunos convocados"}
                  </Badge>
                  <p className="font-semibold">{activeLive.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeLive.courseTitle} · {activeLive.participants.length} participantes
                  </p>
                </div>
                <Link href={`/dashboard/ao-vivo/${activeLive.id}`}>
                  <Button className="bg-red-600 hover:bg-red-700">Gerenciar sessão</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cursos ativos", value: publishedCourses.length },
          { label: "Alunos ativos", value: students.length },
          { label: "Correções pendentes", value: pendingCount },
          {
            label: "Aulas publicadas",
            value: courses.reduce((acc, c) => acc + countLessons(c), 0),
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/cursos">
          <Button>+ Novo curso</Button>
        </Link>
        {pendingCount > 0 && (
          <Link href="/dashboard/correcoes">
            <Button variant="outline">Corrigir redações ({pendingCount})</Button>
          </Link>
        )}
      </div>

      <section>
        <h2 className="font-semibold mb-3">Atividade recente</h2>
        <Card>
          <CardContent className="py-4 space-y-2">
            {activity.map((a) => (
              <p key={a.id} className="text-sm">
                · {a.message} <span className="text-muted-foreground">— {a.timestamp}</span>
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Seus cursos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative h-32 bg-muted">
                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge>{course.level}</Badge>
                  <Badge variant={course.status === "published" ? "success" : "secondary"}>
                    {course.status === "published" ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <CardTitle className="text-base">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{countLessons(course)} aulas</p>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/cursos/${course.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
