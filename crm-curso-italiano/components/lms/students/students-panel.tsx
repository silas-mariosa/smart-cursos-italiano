"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StudentProfile, StudentStatus } from "@lms-mocks/types";
import {
  filterStudents,
  getStudentPendingAttempts,
  getStudentStats,
  resolveStudentStatus,
} from "@lms-mocks/students";
import { useMockStore } from "@/lib/mock-store";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { STATUS_COLORS, STATUS_LABELS, PLAN_STATUS_COLORS, PLAN_STATUS_LABELS } from "@/lib/students/constants";
import { StudentFormDialog } from "./student-form-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck,
  Flame,
  LayoutGrid,
  List,
  Plus,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

export function StudentsPanel() {
  const router = useRouter();
  const { students, courses, attempts, addStudent, planTemplates, tenant } = useMockStore();
  const { canAddStudent, studentLimitMessage, usage, plan } = useTenantPlan();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [formOpen, setFormOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const stats = useMemo(() => getStudentStats(students, attempts, []), [students, attempts]);
  const filtered = useMemo(
    () => filterStudents(students, search, statusFilter, courseFilter),
    [students, search, statusFilter, courseFilter],
  );

  function handleCreate(input: Parameters<typeof addStudent>[0]) {
    setCreateError(null);
    const result = addStudent(input);
    if (result.error || !result.data) {
      setCreateError(result.error ?? "Não foi possível cadastrar o aluno.");
      return;
    }
    router.push(`/dashboard/alunos/${result.data.id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-7 text-primary" />
            Gestão de alunos
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Cadastre, acompanhe progresso, financeiro, certificados e histórico completo de cada aluno.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={!canAddStudent}>
          <UserPlus className="size-4 mr-2" />
          Cadastrar aluno
        </Button>
      </div>

      {(studentLimitMessage || createError) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-3 text-sm text-amber-900">
            {createError ?? studentLimitMessage}{" "}
            <Link href="/dashboard/plano" className="underline font-medium">
              Ver plano ({plan.label})
            </Link>
          </CardContent>
        </Card>
      )}

      {usage.max !== null && (
        <p className="text-xs text-muted-foreground -mt-4">
          Plano {plan.label}: {usage.current} de {usage.max} alunos cadastrados.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<Users className="size-5 text-primary" />} label="Total" value={stats.total} hint={`${stats.active} ativos`} />
        <StatCard icon={<TrendingUp className="size-5 text-blue-600" />} label="Progresso médio" value={`${stats.avgProgress}%`} hint="curso principal" />
        <StatCard icon={<ClipboardCheck className="size-5 text-amber-600" />} label="Correções" value={stats.pendingAttempts} hint="redações pendentes" highlight={stats.pendingAttempts > 0} />
        <StatCard icon={<Flame className="size-5 text-orange-600" />} label="Trials" value={stats.trials} hint="período de teste" />
        <StatCard icon={<Users className="size-5 text-red-600" />} label="Inadimplentes" value={stats.overdue} hint="planos em atraso" highlight={stats.overdue > 0} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border px-3 text-sm bg-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StudentStatus | "all")}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="pending">Pendentes</option>
          <option value="inactive">Inativos</option>
        </select>
        <select
          className="h-10 rounded-md border px-3 text-sm bg-background min-w-[160px]"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="all">Todos os cursos</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <div className="flex border rounded-lg overflow-hidden shrink-0">
          <button type="button" className={cn("px-3 py-2", viewMode === "list" && "bg-muted")} onClick={() => setViewMode("list")}>
            <List className="size-4" />
          </button>
          <button type="button" className={cn("px-3 py-2 border-l", viewMode === "grid" && "bg-muted")} onClick={() => setViewMode("grid")}>
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="size-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Nenhum aluno encontrado</p>
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="size-4 mr-2" />
              Cadastrar primeiro aluno
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StudentCard key={s.id} student={s} attempts={attempts} courses={courses} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Aluno</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Plano</th>
                <th className="text-left p-3 font-medium">Progresso</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Streak</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <StudentRow key={s.id} student={s} attempts={attempts} courses={courses} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        courses={courses.filter((c) => c.tenantId === tenant.id)}
        planTemplates={planTemplates.filter((t) => t.tenantId === tenant.id && t.active)}
        onSave={handleCreate}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-amber-200 bg-amber-50/40")}>
      <CardContent className="pt-4 pb-4">
        <div className="mb-2">{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StudentCard({
  student,
  attempts,
  courses,
}: {
  student: StudentProfile;
  attempts: ReturnType<typeof useMockStore>["attempts"];
  courses: ReturnType<typeof useMockStore>["courses"];
}) {
  const status = resolveStudentStatus(student);
  const mainEnrollment = student.enrollments[0];
  const pending = getStudentPendingAttempts(student.id, attempts).length;
  const courseTitle = courses.find((c) => c.id === mainEnrollment?.courseId)?.title;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-11">
            <AvatarFallback>{student.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{student.name}</p>
            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge className={cn("text-[10px]", STATUS_COLORS[status])}>{STATUS_LABELS[status]}</Badge>
              {student.plan && (
                <Badge className={cn("text-[10px]", PLAN_STATUS_COLORS[student.plan.status])}>
                  {PLAN_STATUS_LABELS[student.plan.status]}
                </Badge>
              )}
              {pending > 0 && <Badge variant="warning" className="text-[10px]">{pending} correção</Badge>}
            </div>
          </div>
        </div>
        {mainEnrollment && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground truncate">{courseTitle ?? mainEnrollment.courseId}</span>
              <span>{mainEnrollment.progressPercent}%</span>
            </div>
            <Progress value={mainEnrollment.progressPercent} className="h-1.5" />
          </div>
        )}
        <Link href={`/dashboard/alunos/${student.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            Abrir perfil
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function StudentRow({
  student,
  attempts,
  courses,
}: {
  student: StudentProfile;
  attempts: ReturnType<typeof useMockStore>["attempts"];
  courses: ReturnType<typeof useMockStore>["courses"];
}) {
  const status = resolveStudentStatus(student);
  const mainEnrollment = student.enrollments[0];
  const pending = getStudentPendingAttempts(student.id, attempts).length;
  const courseTitle = courses.find((c) => c.id === mainEnrollment?.courseId)?.title;

  return (
    <tr className="border-t hover:bg-muted/30">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{student.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="p-3 hidden md:table-cell">
        <Badge className={cn("text-[10px]", STATUS_COLORS[status])}>{STATUS_LABELS[status]}</Badge>
      </td>
      <td className="p-3 hidden lg:table-cell text-xs">
        {student.plan ? (
          <span className={cn("inline-flex px-2 py-0.5 rounded-full", PLAN_STATUS_COLORS[student.plan.status])}>
            {student.plan.name}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="p-3 min-w-[140px]">
        <div className="flex items-center gap-2">
          <Progress value={mainEnrollment?.progressPercent ?? 0} className="flex-1 h-1.5" />
          <span className="text-xs">{mainEnrollment?.progressPercent ?? 0}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">{courseTitle}</p>
      </td>
      <td className="p-3 hidden sm:table-cell text-xs">
        {mainEnrollment?.streakDays ?? 0} dias
        {pending > 0 && <Badge variant="warning" className="ml-2 text-[10px]">{pending}</Badge>}
      </td>
      <td className="p-3">
        <Link href={`/dashboard/alunos/${student.id}`}>
          <Button variant="ghost" size="sm">
            Gerenciar
          </Button>
        </Link>
      </td>
    </tr>
  );
}
