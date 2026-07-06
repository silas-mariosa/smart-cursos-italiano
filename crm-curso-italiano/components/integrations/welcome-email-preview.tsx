"use client";

import type { StudentProfile } from "@lms-mocks/types";
import { Badge } from "@/components/ui/badge";

interface WelcomeEmailPreviewProps {
  tenantName: string;
  tenantSlug: string;
  student: StudentProfile;
  courseTitles: string[];
}

export function WelcomeEmailPreview({
  tenantName,
  tenantSlug,
  student,
  courseTitles,
}: WelcomeEmailPreviewProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
      <Badge variant="outline" className="text-[10px]">
        E-mail simulado — Fase 2 enviará via SMTP
      </Badge>
      <div>
        <p className="text-muted-foreground text-xs">Assunto</p>
        <p className="font-medium">Bem-vindo(a) — seus dados de acesso | {tenantName}</p>
      </div>
      <div className="space-y-2 whitespace-pre-wrap">
        <p>Olá, {student.name}!</p>
        <p>Sua compra foi confirmada. Acesse a plataforma da escola:</p>
        <p>
          <strong>URL:</strong> https://demo.lms/{tenantSlug}
          {"\n"}
          <strong>E-mail:</strong> {student.email}
          {"\n"}
          <strong>Senha provisória:</strong> {student.provisionalPassword ?? "—"}
        </p>
        {courseTitles.length > 0 && (
          <>
            <p>Cursos liberados:</p>
            <ul>
              {courseTitles.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </>
        )}
        <p className="text-muted-foreground text-xs">Recomendamos alterar sua senha no primeiro acesso.</p>
      </div>
    </div>
  );
}
