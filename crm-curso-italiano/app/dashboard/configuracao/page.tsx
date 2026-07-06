"use client";

import { useState } from "react";
import Link from "next/link";
import { useMockStore } from "@/lib/mock-store";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { AiConfigPanel } from "@/components/settings/ai-config-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

function BrandingPanel() {
  const { tenant, setTenant } = useMockStore();
  const [name, setName] = useState(tenant.name);
  const [primary, setPrimary] = useState(tenant.primaryColor);
  const [secondary, setSecondary] = useState(tenant.secondaryColor);
  const [heroTitle, setHeroTitle] = useState(tenant.heroTitle);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setTenant({
      ...tenant,
      name,
      primaryColor: primary,
      secondaryColor: secondary,
      heroTitle,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da escola</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={tenant.slug} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary">Cor primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="w-16 p-1"
                />
                <Input value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary">Cor secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary"
                  type="color"
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  className="w-16 p-1"
                />
                <Input value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="hero">Título do hero (landing)</Label>
            <Textarea id="hero" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>Salvar alterações</Button>
            {saved && <span className="text-sm text-emerald-600 self-center">Salvo!</span>}
            <a href={`http://localhost:3000/${tenant.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Abrir landing ↗</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview ao vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: secondary }}>
            <div
              className="size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: primary }}
            >
              {name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="font-semibold" style={{ color: primary }}>
                {name}
              </p>
              <p className="text-xs text-muted-foreground">Header preview</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfigurationPage() {
  const { tenant, persona } = useMockStore();
  const { canAccessConfiguration, canAccessModule, plan } = useTenantPlan();

  const showAi = canAccessModule("aiGeneration");
  const showBranding = canAccessModule("branding");
  const defaultTab = showAi ? "ai" : "branding";

  if (persona?.role !== "admin") {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5 text-muted-foreground" />
            Acesso restrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Apenas administradores da escola podem acessar as configurações.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canAccessConfiguration) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5 text-muted-foreground" />
            Configuração indisponível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seu plano atual ({plan.label}) não inclui configuração de branding nem integração com ChatGPT.
            Faça upgrade para desbloquear.
          </p>
          <Link href="/dashboard/plano" className={cn(buttonVariants())}>
            Ver meu plano
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!showAi && !showBranding) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Nenhuma configuração disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum módulo de configuração está ativo no seu plano. Entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Configuração — {tenant.name}</h1>

      {showAi && showBranding ? (
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="ai">Integração ChatGPT</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>
          <TabsContent value="ai">
            <AiConfigPanel />
          </TabsContent>
          <TabsContent value="branding">
            <BrandingPanel />
          </TabsContent>
          <TabsContent value="integrations">
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte Kiwify ou Hotmart para matricular alunos automaticamente após compra.
                </p>
                <Link href="/dashboard/configuracao/integracoes" className={cn(buttonVariants())}>
                  Configurar integrações
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : showAi ? (
        <AiConfigPanel />
      ) : (
        <BrandingPanel />
      )}
    </div>
  );
}
