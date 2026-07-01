"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, Video, ClipboardList } from "lucide-react";
import { courses } from "@lms-mocks/courses";
import { demoPersonas } from "@lms-mocks/students";
import { useTenant } from "@/lib/context/TenantContext";
import { TenantHeader } from "@/components/lms/tenant-header";
import { CoursePreviewCard } from "@/components/lms/course-card";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const featureIcons = { users: Users, video: Video, clipboard: ClipboardList };

export default function TenantLandingPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const { tenant } = useTenant();
  const publishedCourses = courses.filter((c) => c.status === "published");

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <TenantHeader tenantSlug={tenantSlug} />
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: tenant.secondaryColor }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              {tenant.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground">{tenant.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${tenantSlug}/auth/login`}>
                <Button size="lg">Acessar minha área</Button>
              </Link>
              <Link href={`#cursos`}>
                <Button size="lg" variant="outline">
                  Conhecer os cursos
                </Button>
              </Link>
            </div>
          </div>
          <div
            className="rounded-2xl p-8 h-64 md:h-80 flex items-center justify-center text-center"
            style={{ backgroundColor: tenant.secondaryColor }}
          >
            <div>
              <p className="text-6xl mb-2">🇮🇹</p>
              <p className="font-medium text-lg">Impara l&apos;italiano con noi</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30" id="sobre">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Por que escolher a {tenant.name}?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tenant.landingFeatures.map((f) => {
              const Icon = featureIcons[f.icon as keyof typeof featureIcons] ?? Users;
              return (
                <Card key={f.title}>
                  <CardContent className="pt-6 space-y-3">
                    <Icon className="size-8 text-primary" />
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16" id="cursos">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold mb-8">Cursos em destaque</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => (
              <CoursePreviewCard
                key={course.id}
                course={course}
                tenantSlug={tenantSlug}
                href={`/${tenantSlug}/auth/login`}
                ctaLabel="Começar agora"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">O que dizem nossos alunos</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tenant.testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6 flex gap-4">
                  <Avatar>
                    <AvatarFallback>{t.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                    <p className="text-sm font-medium mt-2">— {t.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 mt-auto">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span>{tenant.name} © {new Date().getFullYear()}</span>
          <span>Modo demonstração · {demoPersonas.filter((p) => p.role === "student").length} personas de aluno</span>
        </div>
      </footer>
    </div>
  );
}
