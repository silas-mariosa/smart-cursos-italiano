"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { demoPersonas } from "@lms-mocks/students";
import { useTenant } from "@/lib/context/TenantContext";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const { tenant } = useTenant();
  const { login } = useDemoStudent();
  const router = useRouter();
  const students = demoPersonas.filter((p) => p.role === "student");

  function handleLogin(personaId: string) {
    login(personaId);
    router.push(`/${tenantSlug}/dashboard`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div
              className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl text-white font-bold"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              SI
            </div>
            <CardTitle>Bem-vinda de volta!</CardTitle>
            <p className="text-sm text-muted-foreground">Acesse sua área de estudos — {tenant.name}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-medium text-amber-900">Escolha um perfil para explorar:</p>
              {students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleLogin(s.id)}
                  className="w-full flex items-center gap-3 rounded-lg border bg-background p-3 hover:bg-accent transition-colors text-left"
                >
                  <Avatar>
                    <AvatarFallback>{s.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  {s.progressPercent !== undefined && (
                    <Badge variant="secondary">{s.progressPercent}%</Badge>
                  )}
                </button>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Login com e-mail disponível na versão com servidor
            </p>
            <Link href={`/${tenantSlug}`} className="block text-center text-sm text-primary hover:underline">
              ← Voltar para o site
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
