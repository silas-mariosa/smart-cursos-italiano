"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Course } from "@lms-mocks/types";

export function CoursePreviewCard({
  course,
  tenantSlug,
  progressPercent,
  href,
  ctaLabel = "Ver curso",
}: {
  course: Course;
  tenantSlug: string;
  progressPercent?: number;
  href?: string;
  ctaLabel?: string;
}) {
  const link = href ?? `/${tenantSlug}/cursos/${course.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-muted">
        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" unoptimized />
        <Badge className="absolute top-3 left-3">{course.level}</Badge>
      </div>
      <CardHeader className="pb-2">
        <h3 className="font-semibold line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
      </CardHeader>
      {progressPercent !== undefined && (
        <CardContent className="pb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </CardContent>
      )}
      <CardFooter>
        <Link href={link} className="w-full">
          <Button className="w-full">{ctaLabel}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
