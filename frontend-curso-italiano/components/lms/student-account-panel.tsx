"use client";

import Link from "next/link";
import type { Course, StudentProfile } from "@lms-mocks/types";
import { getCourseTitle, resolveStudentStatus } from "@lms-mocks/students";
import { canStudentAccessCourse, getCourseAccessBlockReason, ACCESS_BLOCK_LABELS, PLAN_CYCLE_LABELS } from "@/lib/students/access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCard, MessageCircle, User } from "lucide-react";

const STATUS_LABELS = { active: "Ativo", inactive: "Inativo", pending: "Pendente" } as const;
const PLAN_STATUS_LABELS = {
  active: "Em dia",
  overdue: "Inadimplente",
  trial: "Trial",
  cancelled: "Cancelado",
} as const;

interface StudentAccountPanelProps {
  profile: StudentProfile;
  courses: Course[];
  tenantSlug: string;
}

export function StudentAccountPanel({ profile, courses, tenantSlug }: StudentAccountPanelProps) {
  const status = resolveStudentStatus(profile);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="size-7 text-primary" />
          Minha conta
        </h1>
        <p className="text-muted-foreground mt-1">Situação da matrícula, plano e acesso aos cursos</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conta</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <span className="text-muted-foreground">Nome:</span> {profile.name}
          </p>
          <p>
            <span className="text-muted-foreground">E-mail:</span> {profile.email}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>
          </p>
        </CardContent>
      </Card>

      {profile.plan && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4" />
              Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Plano:</span> {profile.plan.name}
            </p>
            <p>
              <span className="text-muted-foreground">Valor:</span> R$ {profile.plan.amount.toFixed(2)} /{" "}
              {PLAN_CYCLE_LABELS[profile.plan.cycle]}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Situação:</span>
              <Badge variant={profile.plan.status === "overdue" ? "warning" : "secondary"}>
                {PLAN_STATUS_LABELS[profile.plan.status]}
              </Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Próximo vencimento:</span>{" "}
              {new Date(profile.plan.nextDueDate).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      )}

      {(profile.payments ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pagamentos recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(profile.payments ?? []).slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                <span>{p.description}</span>
                <span className="font-medium">R$ {p.amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Meus cursos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum curso matriculado.</p>
          ) : (
            profile.enrollments.map((e) => {
              const access = canStudentAccessCourse(profile, e.courseId);
              const reason = getCourseAccessBlockReason(profile, e.courseId);
              const title = getCourseTitle(courses, e.courseId);
              return (
                <div key={e.courseId} className="flex flex-wrap items-center justify-between gap-2 text-sm border rounded-lg p-3">
                  <span className="font-medium">{title}</span>
                  <Badge className={cn(access ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800")}>
                    {access ? "Acesso liberado" : reason ? ACCESS_BLOCK_LABELS[reason] : "Bloqueado"}
                  </Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="size-8 text-primary" />
            <div>
              <p className="font-medium">Precisa de ajuda?</p>
              <p className="text-sm text-muted-foreground">Envie uma mensagem para a escola</p>
            </div>
          </div>
          <Link href={`/${tenantSlug}/minha-conta/suporte`}>
            <Button>Abrir suporte</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
