"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudentProfile } from "@lms-mocks/students";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const { persona } = useDemoStudent();
  const profile = persona ? getStudentProfile(persona.id) : null;

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <Link href={`/${tenantSlug}/dashboard`} className="text-sm text-primary hover:underline">
        ← Dashboard
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-lg">{profile.avatar}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground">
            Membro desde {new Date(profile.memberSince).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Italiano — Nível A1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{skill.name}</span>
                <span>{skill.percent}%</span>
              </div>
              <Progress value={skill.percent} />
            </div>
          ))}
        </CardContent>
      </Card>

      <section>
        <h2 className="font-semibold mb-3">Histórico de atividade</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Concluiu Aula 2 — há 2 dias</p>
          <p>• Exercício MC-001 — 100%</p>
          <p>• Iniciou curso A1 — mar/2026</p>
        </div>
      </section>

      <Badge variant="outline">Perfil completo disponível na Fase 2</Badge>
    </div>
  );
}
