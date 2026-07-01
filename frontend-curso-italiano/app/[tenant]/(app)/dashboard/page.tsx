"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Flame, PlayCircle, Video, Dumbbell } from "lucide-react";
import { useDemoCourses } from "@/lib/hooks/useDemoCourses";
import { getLessonFromCourses } from "@lms-mocks/courses";
import { useActiveLiveSession } from "@/lib/hooks/useLiveSessions";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { CoursePreviewCard } from "@/components/lms/course-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const { persona, progress, getCourseProgress, grades, refreshGrades } = useDemoStudent();

  const courses = useDemoCourses();
  const enrolledCourses = courses.filter((c) => c.status === "published" || c.id === "course-a2");
  const continueLessonId = progress.lastLessonId ?? "lesson-a1-1";
  const continueData = getLessonFromCourses(courses, "course-a1", continueLessonId);
  const studentGrades = grades.filter((g) => g.studentId === persona?.id);
  const liveSession = useActiveLiveSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Olá, {persona?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">Continue seu aprendizado de italiano</p>
      </div>

      {liveSession && (liveSession.status === "waiting" || liveSession.status === "live") && (
        <Card className="border-red-300 bg-red-50/80 overflow-hidden">
          <CardContent className="py-0 p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-red-600 text-white px-6 py-4 sm:py-6 flex items-center justify-center sm:w-32 shrink-0">
                <Video className="size-10" />
              </div>
              <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-red-600 text-white border-0 mb-2 animate-pulse">
                    Você foi convocado!
                  </Badge>
                  <p className="font-semibold">{liveSession.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {liveSession.instructorName} · {liveSession.topic}
                  </p>
                </div>
                <Link href={`/${tenantSlug}/ao-vivo/${liveSession.id}`}>
                  <Button className="bg-red-600 hover:bg-red-700">Entrar na aula ao vivo</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {continueData && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlayCircle className="size-5 text-primary" />
              Continuar de onde parou
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{continueData.lesson.title}</p>
              <p className="text-sm text-muted-foreground">
                {continueData.course.title} · {continueData.module.title}
              </p>
              <div className="mt-2 max-w-xs">
                <Progress value={getCourseProgress("course-a1")} />
              </div>
            </div>
            <Link href={`/${tenantSlug}/cursos/course-a1/aulas/${continueLessonId}`}>
              <Button>Continuar aula →</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <BookOpen className="size-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{enrolledCourses.length}</p>
              <p className="text-xs text-muted-foreground">Cursos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <PlayCircle className="size-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{progress.completedLessonIds.length}</p>
              <p className="text-xs text-muted-foreground">Aulas concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Flame className="size-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Meus cursos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <CoursePreviewCard
              key={course.id}
              course={course}
              tenantSlug={tenantSlug}
              progressPercent={getCourseProgress(course.id)}
              ctaLabel={getCourseProgress(course.id) > 0 ? "Continuar" : "Começar"}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Minhas notas recentes</h2>
          <Button variant="ghost" size="sm" onClick={refreshGrades}>
            Atualizar
          </Button>
        </div>
        {studentGrades.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma nota ainda. Complete exercícios!</p>
        ) : (
          <div className="space-y-3">
            {studentGrades.map((g) => (
              <Card key={g.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{g.feedback}</p>
                  </div>
                  <Badge variant={g.score >= 80 ? "success" : "secondary"}>
                    {g.score}/{g.maxScore}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <Link href={`/${tenantSlug}/praticar`}>
          <Card className="hover:border-primary/50 transition-colors h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <Dumbbell className="size-10 text-primary shrink-0" />
              <div>
                <p className="font-semibold">Central de prática</p>
                <p className="text-sm text-muted-foreground">Quizzes, flashcards e simulador</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/${tenantSlug}/ao-vivo`}>
          <Card className="hover:border-primary/50 transition-colors h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <Video className="size-10 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold">Aulas ao vivo</p>
                <p className="text-sm text-muted-foreground">Conversação com professor em tempo real</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
