"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { StudentProfile, StudentStatus } from "@lms-mocks/types";
import {
  buildStudentTimeline,
  getCourseTitle,
  getStudentPendingAttempts,
  resolveStudentStatus,
} from "@lms-mocks/students";
import { formatRelativeTime } from "@/lib/corrections/utils";
import { useMockStore } from "@/lib/mock-store";
import { HISTORY_TYPE_LABELS, PLAN_STATUS_COLORS, PLAN_STATUS_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/students/constants";
import { ACCESS_SOURCE_LABELS, PLAN_CYCLE_LABELS } from "@/lib/students/access";
import { StudentCoursesTab } from "@/components/lms/students/student-courses-tab";
import { RegisterPaymentDialog } from "@/components/lms/students/register-payment-dialog";
import { WelcomeEmailPreview } from "@/components/integrations/welcome-email-preview";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  FileText,
  History,
  Mail,
  Phone,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface StudentDetailPanelProps {
  studentId: string;
}

export function StudentDetailPanel({ studentId }: StudentDetailPanelProps) {
  const {
    students,
    courses,
    grades,
    attempts,
    tenant,
    updateStudent,
    setStudentStatus,
    confirmStudentPayment,
    markStudentOverdue,
    registerStudentPayment,
    enrollStudentInCourse,
    issueStudentCertificate,
    persona,
    createSupportConversation,
  } = useMockStore();

  const student = students.find((s) => s.id === studentId);
  const [notes, setNotes] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const pendingAttempts = student ? getStudentPendingAttempts(student.id, attempts) : [];
  const studentGrades = student ? grades.filter((g) => g.studentId === student.id) : [];
  const timeline = useMemo(() => {
    if (!student) return [];
    return buildStudentTimeline(student, grades, attempts);
  }, [student, grades, attempts]);

  useEffect(() => {
    setNotes(student?.notes ?? "");
  }, [student?.id, student?.notes]);

  if (!student) {
    return (
      <div className="space-y-4">
        <p>Aluno não encontrado</p>
        <Link href="/dashboard/alunos">
          <Button variant="outline">← Voltar</Button>
        </Link>
      </div>
    );
  }

  const status = resolveStudentStatus(student);
  const avgGrade =
    studentGrades.length > 0
      ? Math.round(studentGrades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / studentGrades.length)
      : null;

  function saveNotes() {
    updateStudent({ id: studentId, notes });
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/alunos" className="text-sm text-primary hover:underline">
        ← Gestão de alunos
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg font-semibold">{student.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <Badge className={cn(STATUS_COLORS[status])}>{STATUS_LABELS[status]}</Badge>
              {student.plan && (
                <Badge className={cn(PLAN_STATUS_COLORS[student.plan.status])}>
                  {PLAN_STATUS_LABELS[student.plan.status]}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" />
                  {student.phone}
                </span>
              )}
              <span>Membro desde {new Date(student.memberSince).toLocaleDateString("pt-BR")}</span>
              {student.accessSource && (
                <span>Origem: {ACCESS_SOURCE_LABELS[student.accessSource]}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pendingAttempts.length > 0 && (
            <Link href={`/dashboard/correcoes/${pendingAttempts[0].id}`}>
              <Button variant="outline" size="sm">
                <ClipboardCheck className="size-4 mr-1" />
                Corrigir ({pendingAttempts.length})
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              createSupportConversation({
                studentId: student.id,
                subject: "Contato da escola",
                body: "Olá! Entramos em contato sobre sua matrícula.",
                staffName: persona?.name ?? "Equipe",
              })
            }
          >
            Iniciar conversa
          </Button>
          <Link href="/dashboard/suporte">
            <Button variant="outline" size="sm">
              Suporte
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStudentStatus(student.id, status === "active" ? "inactive" : "active")}
          >
            {status === "active" ? "Desativar" : "Reativar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Progresso A1" value={`${student.enrollments[0]?.progressPercent ?? 0}%`} icon={<TrendingUp className="size-4" />} />
        <MiniStat label="Streak" value={`${student.enrollments[0]?.streakDays ?? 0} dias`} icon={<Sparkles className="size-4" />} />
        <MiniStat label="Média" value={avgGrade != null ? `${avgGrade}%` : "—"} icon={<FileText className="size-4" />} />
        <MiniStat
          label="Plano"
          value={student.plan ? `R$ ${student.plan.amount.toFixed(0)}` : "—"}
          icon={<CreditCard className="size-4" />}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="exercises">Exercícios</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="settings">Cadastro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span>{skill.percent}%</span>
                    </div>
                    <Progress value={skill.percent} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notas internas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre o aluno..." />
                <Button size="sm" onClick={saveNotes}>
                  Salvar notas
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-6">
          {student.enrollments.map((enrollment) => {
            const course = courses.find((c) => c.id === enrollment.courseId);
            const lessonCount = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
            return (
              <Card key={enrollment.courseId}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{course?.title ?? enrollment.courseId}</p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.completedLessonIds.length}/{lessonCount} aulas · streak {enrollment.streakDays} dias
                      </p>
                    </div>
                    <Badge>{enrollment.progressPercent}%</Badge>
                  </div>
                  <Progress value={enrollment.progressPercent} />
                  {course && (
                    <Link href={`/dashboard/cursos/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <BookOpen className="size-4 mr-1" />
                        Ver curso
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
          <Card className="border-dashed">
            <CardContent className="py-4">
              <p className="text-sm font-medium mb-2">Matricular em novo curso</p>
              <div className="flex flex-wrap gap-2">
                {courses
                  .filter((c) => !student.enrollments.some((e) => e.courseId === c.id))
                  .map((c) => (
                    <Button key={c.id} variant="outline" size="sm" onClick={() => enrollStudentInCourse(student.id, c.id)}>
                      + {c.title}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4 mt-6">
          {pendingAttempts.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ClipboardCheck className="size-4 text-amber-600" />
                Correções pendentes
              </h3>
              {pendingAttempts.map((a) => (
                <Card key={a.id} className="border-amber-200">
                  <CardContent className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{a.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.answer}</p>
                    </div>
                    <Link href={`/dashboard/correcoes/${a.id}`}>
                      <Button size="sm">Corrigir</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
          <section className="space-y-2">
            <h3 className="font-semibold text-sm">Notas e exercícios</h3>
            {studentGrades.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma nota registrada ainda.</p>
            ) : (
              studentGrades.map((g) => (
                <Card key={g.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(g.submittedAt)}</p>
                    </div>
                    <Badge variant={g.status === "auto_graded" ? "secondary" : "success"}>
                      {g.score}/{g.maxScore}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <StudentCoursesTab student={student} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-6">
          {student.plan ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Plano atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">{student.plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span>
                    R$ {student.plan.amount.toFixed(2)} /{" "}
                    {PLAN_CYCLE_LABELS[student.plan.cycle] ?? student.plan.cycle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={cn("text-[10px]", PLAN_STATUS_COLORS[student.plan.status])}>
                    {PLAN_STATUS_LABELS[student.plan.status]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo vencimento</span>
                  <span>{new Date(student.plan.nextDueDate).toLocaleDateString("pt-BR")}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum plano configurado.</p>
          )}

          <section>
            <h3 className="font-semibold text-sm mb-2">Histórico de pagamentos</h3>
            {(student.payments ?? []).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhum pagamento registrado</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {(student.payments ?? []).map((p) => (
                  <Card key={p.id}>
                    <CardContent className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{p.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {p.amount.toFixed(2)}</p>
                        <Badge variant={p.status === "paid" ? "success" : p.status === "pending" ? "warning" : "secondary"} className="text-[10px]">
                          {p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : "Falhou"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setPaymentOpen(true)}>
              Registrar pagamento
            </Button>
            <Button variant="outline" size="sm" onClick={() => confirmStudentPayment(student.id)}>
              Confirmar pagamento
            </Button>
            <Button variant="outline" size="sm" onClick={() => markStudentOverdue(student.id)}>
              Marcar inadimplente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudentStatus(student.id, status === "active" ? "inactive" : "active")}
            >
              {status === "active" ? "Restringir acesso" : "Liberar acesso"}
            </Button>
            {student.welcomeEmailSentAt && (
              <Button variant="ghost" size="sm" onClick={() => setEmailPreviewOpen(true)}>
                Ver e-mail enviado
              </Button>
            )}
          </div>

          <RegisterPaymentDialog
            open={paymentOpen}
            onOpenChange={setPaymentOpen}
            onSave={(p) =>
              registerStudentPayment(student.id, {
                ...p,
                status: "paid",
              })
            }
          />

          {emailPreviewOpen && (
            <WelcomeEmailPreview
              tenantName={tenant.name}
              tenantSlug={tenant.slug}
              student={student}
              courseTitles={student.enrollments.map((e) => getCourseTitle(courses, e.courseId))}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="size-4" />
                Linha do tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem atividades registradas.</p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((item, i) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="size-2.5 rounded-full bg-primary mt-1.5" />
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-border min-h-[24px]" />}
                      </div>
                      <div className="pb-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {HISTORY_TYPE_LABELS[item.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</span>
                        </div>
                        <p className="text-sm font-medium mt-0.5">{item.title}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4 mt-6">
          {(student.certificates ?? []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Award className="size-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-medium">Nenhum certificado emitido</p>
                <p className="text-sm text-muted-foreground mt-1">Emita quando o aluno concluir um curso.</p>
              </CardContent>
            </Card>
          ) : (
            (student.certificates ?? []).map((cert) => (
              <Card key={cert.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Award className="size-8 text-amber-600" />
                    <div>
                      <p className="font-medium">{cert.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.status === "issued" ? "Emitido" : cert.status === "pending" ? "Pendente" : "Revogado"} ·{" "}
                        {new Date(cert.issuedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled title="Fase 2">
                    Baixar PDF
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          <Card>
            <CardContent className="py-4 space-y-3">
              <p className="text-sm font-medium">Emitir certificado</p>
              <div className="flex flex-wrap gap-2">
                {student.enrollments.map((e) => {
                  const title = getCourseTitle(courses, e.courseId);
                  const already = (student.certificates ?? []).some(
                    (c) => c.courseId === e.courseId && c.status !== "revoked",
                  );
                  return (
                    <Button
                      key={e.courseId}
                      variant="outline"
                      size="sm"
                      disabled={already || e.progressPercent < 80}
                      title={e.progressPercent < 80 ? "Requer 80% de progresso" : already ? "Já emitido" : undefined}
                      onClick={() => issueStudentCertificate(student.id, e.courseId, title)}
                    >
                      {title}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Requer mínimo de 80% de progresso no curso.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="size-4" />
                Dados cadastrais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StudentEditForm student={student} onSave={updateStudent} />
              <Separator />
              <div className="space-y-2">
                <Label>Status da conta</Label>
                <div className="flex flex-wrap gap-2">
                  {(["active", "pending", "inactive"] as StudentStatus[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={status === s ? "default" : "outline"}
                      onClick={() => setStudentStatus(student.id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}</div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function StudentEditForm({
  student,
  onSave,
}: {
  student: StudentProfile;
  onSave: (input: { id: string; name?: string; email?: string; phone?: string }) => void;
}) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone ?? "");

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>E-mail</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Telefone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Button
          onClick={() => onSave({ id: student.id, name: name.trim(), email: email.trim(), phone: phone.trim() || undefined })}
        >
          Salvar cadastro
        </Button>
      </div>
    </div>
  );
}
