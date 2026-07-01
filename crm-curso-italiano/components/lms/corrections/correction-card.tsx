"use client";

import Link from "next/link";
import type { WrittenAttempt } from "@lms-mocks/types";
import { countWords, formatRelativeTime } from "@/lib/corrections/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, Clock, FileText, User } from "lucide-react";

interface CorrectionCardProps {
  attempt: WrittenAttempt;
  variant?: "pending" | "graded" | "compact";
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function CorrectionCard({ attempt, variant = "pending" }: CorrectionCardProps) {
  const wordCount = countWords(attempt.answer);
  const isPending = attempt.status === "pending";
  const isGraded = attempt.status === "graded";

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        isPending && variant === "pending" && "border-amber-200 bg-amber-50/30",
      )}
    >
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {initials(attempt.studentName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {isPending ? (
                  <Badge variant="warning">Pendente</Badge>
                ) : (
                  <Badge variant="success">Corrigida</Badge>
                )}
                <span className="font-semibold text-sm">{attempt.studentName}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatRelativeTime(attempt.submittedAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" />
                  {attempt.courseTitle}
                </span>
                <span>·</span>
                <span>{attempt.lessonTitle}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <FileText className="size-3" />
                  {wordCount} palavra(s)
                </span>
              </div>

              <div className="rounded-lg border bg-background/80 p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Enunciado</p>
                <p className="text-sm line-clamp-2">{attempt.prompt}</p>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground pt-1">Resposta</p>
                <p className="text-sm italic line-clamp-3">&ldquo;{attempt.answer}&rdquo;</p>
              </div>

              {isGraded && attempt.score != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="success">
                    Nota {attempt.score}/{attempt.maxScore}
                  </Badge>
                  {attempt.feedback && (
                    <p className="text-muted-foreground line-clamp-1 text-xs">{attempt.feedback}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0 sm:items-end">
            <Link href={`/dashboard/alunos/${attempt.studentId}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                <User className="size-3.5 mr-1" />
                Perfil
              </Button>
            </Link>
            <Link href={`/dashboard/correcoes/${attempt.id}`}>
              <Button size="sm" variant={isPending ? "default" : "outline"}>
                {isPending ? "Corrigir" : "Ver correção"}
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
