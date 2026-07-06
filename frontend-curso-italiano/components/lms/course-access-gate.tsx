"use client";

import Link from "next/link";
import type { StudentProfile } from "@lms-mocks/types";
import { getCourseAccessBlockReason, ACCESS_BLOCK_LABELS } from "@/lib/students/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface CourseAccessGateProps {
  student: StudentProfile;
  courseId: string;
  tenantSlug: string;
  children: React.ReactNode;
}

export function CourseAccessGate({ student, courseId, tenantSlug, children }: CourseAccessGateProps) {
  const reason = getCourseAccessBlockReason(student, courseId);
  if (!reason) return <>{children}</>;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="border-dashed">
        <CardContent className="py-12 text-center space-y-4">
          <Lock className="size-12 mx-auto text-muted-foreground opacity-50" />
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="text-muted-foreground">{ACCESS_BLOCK_LABELS[reason]}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href={`/${tenantSlug}/minha-conta`}>
              <Button variant="outline">Ver minha situação</Button>
            </Link>
            <Link href={`/${tenantSlug}/minha-conta/suporte?subject=${encodeURIComponent("Problema com acesso ao curso")}`}>
              <Button>Falar com a escola</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
