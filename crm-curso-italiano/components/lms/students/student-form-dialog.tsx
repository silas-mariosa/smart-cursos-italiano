"use client";

import { useEffect, useState } from "react";
import type { Course } from "@lms-mocks/types";
import type { CreateStudentInput } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onSave: (input: CreateStudentInput) => void;
}

export function StudentFormDialog({ open, onOpenChange, courses, onSave }: StudentFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseIds, setCourseIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setPhone("");
    setCourseIds(courses[0]?.id ? [courses[0].id] : []);
  }, [open, courses]);

  function toggleCourse(courseId: string) {
    setCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  }

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    onSave({ name, email, phone: phone || undefined, courseIds });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar aluno</DialogTitle>
          <DialogDescription>
            Crie o cadastro e matricule em um ou mais cursos. O aluno receberá acesso por e-mail (Fase 2).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Pereira" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aluno@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Telefone (opcional)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-0000" />
          </div>
          <div className="space-y-2">
            <Label>Matricular em</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  {c.title}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !email.trim()}>
            Cadastrar aluno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
