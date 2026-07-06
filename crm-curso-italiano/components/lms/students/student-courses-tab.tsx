"use client";

import { useState } from "react";
import Link from "next/link";
import type { StudentProfile } from "@lms-mocks/types";
import { getCourseTitle } from "@lms-mocks/students";
import { canStudentAccessCourse } from "@/lib/students/access";
import { useMockStore } from "@/lib/mock-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentCoursesTabProps {
  student: StudentProfile;
}

export function StudentCoursesTab({ student }: StudentCoursesTabProps) {
  const { courses, planTemplates, tenant, enrollStudentInCourse, unenrollStudentFromCourse, applyPlanTemplateToStudent } =
    useMockStore();
  const [addOpen, setAddOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);
  const available = tenantCourses.filter(
    (c) => !student.enrollments.some((e) => e.courseId === c.id),
  );
  const tenantTemplates = planTemplates.filter((t) => t.tenantId === tenant.id && t.active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          Adicionar curso
        </Button>
        <Button size="sm" variant="outline" onClick={() => setTemplateOpen(true)} disabled={tenantTemplates.length === 0}>
          Aplicar template
        </Button>
        <Link href={`/dashboard/suporte?student=${student.id}`}>
          <Button size="sm" variant="ghost">
            Ver suporte
          </Button>
        </Link>
      </div>

      {student.enrollments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma matrícula. Adicione cursos ou aplique um template.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {student.enrollments.map((e) => {
            const title = getCourseTitle(courses, e.courseId);
            const access = canStudentAccessCourse(student, e.courseId);
            return (
              <Card key={e.courseId}>
                <CardContent className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.fromTemplateId ? "Via template" : "Matrícula manual"} · {e.progressPercent}% concluído
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={access ? "success" : "secondary"}>
                      {access ? "Acesso liberado" : "Bloqueado"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => unenrollStudentFromCourse(student.id, e.courseId)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar curso</DialogTitle>
          </DialogHeader>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Selecione...</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedCourse) {
                  enrollStudentInCourse(student.id, selectedCourse);
                  setAddOpen(false);
                }
              }}
              disabled={!selectedCourse}
            >
              Matricular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Adiciona plano e matricula nos cursos do template (sem remover existentes).
          </p>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Selecione...</option>
            {tenantTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  applyPlanTemplateToStudent(student.id, selectedTemplate);
                  setTemplateOpen(false);
                }
              }}
              disabled={!selectedTemplate}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
