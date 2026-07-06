"use client";

import Link from "next/link";
import { Dumbbell, Layers, MessageCircle, HelpCircle } from "lucide-react";
import { getStudentLessonPracticeHref } from "@lms-mocks/course-routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PracticeCTA({
  tenantSlug,
  courseId,
  moduleSlug,
  lessonSlug,
  exerciseCount,
  flashcardCount = 0,
  simulatorCount = 0,
}: {
  tenantSlug: string;
  courseId: string;
  moduleSlug: string;
  lessonSlug: string;
  exerciseCount: number;
  flashcardCount?: number;
  simulatorCount?: number;
}) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="size-5 text-primary" />
              <h3 className="font-semibold">Hora de praticar!</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Os exercícios ficam em uma área separada. Pratique com quizzes, flashcards e simulador de conversação.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {exerciseCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-background rounded-full px-2.5 py-1 border">
                  <HelpCircle className="size-3" /> {exerciseCount} quiz{exerciseCount !== 1 ? "zes" : ""}
                </span>
              )}
              {flashcardCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-background rounded-full px-2.5 py-1 border">
                  <Layers className="size-3" /> {flashcardCount} flashcard{flashcardCount !== 1 ? "s" : ""}
                </span>
              )}
              {simulatorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-background rounded-full px-2.5 py-1 border">
                  <MessageCircle className="size-3" /> {simulatorCount} cenário{simulatorCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <Link href={getStudentLessonPracticeHref(tenantSlug, courseId, moduleSlug, lessonSlug)}>
            <Button size="lg">Ir para prática →</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
