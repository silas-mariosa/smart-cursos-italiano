"use client";

import { useState } from "react";
import type { IntegrationProvider, ProductCourseMapping, WebhookEvent } from "@lms-mocks/types";
import { getCourseTitle } from "@lms-mocks/students";
import { useMockStore } from "@/lib/mock-store";
import { WelcomeEmailPreview } from "@/components/integrations/welcome-email-preview";
import { WebhookSimulateDialog } from "@/components/integrations/webhook-simulate-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Plus, Trash2, Zap } from "lucide-react";

const PROVIDERS: IntegrationProvider[] = ["kiwify", "hotmart"];

function ProviderPanel({ provider }: { provider: IntegrationProvider }) {
  const {
    tenant,
    courses,
    getIntegrations,
    updateIntegration,
    addProductMapping,
    removeProductMapping,
    webhookEvents,
    simulateWebhookPurchase,
  } = useMockStore();

  const integration = getIntegrations().find((i) => i.provider === provider)!;
  const tenantCourses = courses.filter((c) => c.tenantId === tenant.id);
  const events = webhookEvents.filter((e) => e.tenantId === tenant.id && e.provider === provider);

  const [mappingOpen, setMappingOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [courseId, setCourseId] = useState(tenantCourses[0]?.id ?? "");
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ student: import("@lms-mocks/types").StudentProfile } | null>(null);

  function copyUrl() {
    void navigator.clipboard.writeText(integration.webhookUrl);
  }

  function addMapping() {
    if (!productId.trim() || !courseId) return;
    const mapping: ProductCourseMapping = {
      externalProductId: productId.trim(),
      externalProductName: productName.trim() || productId.trim(),
      courseId,
    };
    addProductMapping(provider, mapping);
    setProductId("");
    setProductName("");
    setMappingOpen(false);
  }

  function handleSimulate(input: { buyerName: string; buyerEmail: string; productId: string }) {
    const result = simulateWebhookPurchase({ provider, ...input });
    if (result) {
      setEmailPreview({ student: result.student });
    }
    setSimulateOpen(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base capitalize">{provider}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Integração ativa</Label>
              <p className="text-xs text-muted-foreground">Receber eventos de compra (simulado)</p>
            </div>
            <Button
              variant={integration.enabled ? "default" : "outline"}
              size="sm"
              onClick={() => updateIntegration(provider, { enabled: !integration.enabled })}
            >
              {integration.enabled ? "Ativa" : "Inativa"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>URL do webhook</Label>
            <div className="flex gap-2">
              <Input readOnly value={integration.webhookUrl} className="font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={copyUrl} type="button">
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secret</Label>
            <Input readOnly value={integration.webhookSecret} className="font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Mapeamento produto → curso</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setMappingOpen(true)}>
            <Plus className="size-3.5 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {integration.productMappings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum produto mapeado.</p>
          ) : (
            <div className="space-y-2">
              {integration.productMappings.map((m) => (
                <div key={m.externalProductId} className="flex items-center justify-between gap-2 text-sm border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{m.externalProductName}</p>
                    <p className="text-xs text-muted-foreground">ID: {m.externalProductId}</p>
                    <p className="text-xs">→ {getCourseTitle(tenantCourses, m.courseId)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeProductMapping(provider, m.externalProductId)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setSimulateOpen(true)} disabled={!integration.enabled}>
          <Zap className="size-4 mr-2" />
          Simular compra aprovada
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log de eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((e: WebhookEvent) => (
                <div key={e.id} className="text-sm border rounded p-2 flex justify-between gap-2">
                  <div>
                    <p>{e.buyerName} — {e.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.processedAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <Badge variant={e.status === "success" ? "success" : "secondary"}>{e.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mappingOpen} onOpenChange={setMappingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo mapeamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>ID do produto ({provider})</Label>
              <Input value={productId} onChange={(e) => setProductId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nome do produto</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Curso na plataforma</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                {tenantCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={addMapping} disabled={!productId.trim() || !courseId}>
              Salvar mapeamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <WebhookSimulateDialog
        open={simulateOpen}
        onOpenChange={setSimulateOpen}
        productMappings={integration.productMappings}
        onSimulate={handleSimulate}
      />

      <Dialog open={!!emailPreview} onOpenChange={() => setEmailPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview do e-mail de boas-vindas</DialogTitle>
          </DialogHeader>
          {emailPreview && (
            <WelcomeEmailPreview
              tenantName={tenant.name}
              tenantSlug={tenant.slug}
              student={emailPreview.student}
              courseTitles={emailPreview.student.enrollments.map((e) => getCourseTitle(tenantCourses, e.courseId))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function IntegrationConfigPanel() {
  return (
    <Tabs defaultValue="kiwify">
      <TabsList>
        <TabsTrigger value="kiwify">Kiwify</TabsTrigger>
        <TabsTrigger value="hotmart">Hotmart</TabsTrigger>
      </TabsList>
      <TabsContent value="kiwify" className="mt-6">
        <ProviderPanel provider="kiwify" />
      </TabsContent>
      <TabsContent value="hotmart" className="mt-6">
        <ProviderPanel provider="hotmart" />
      </TabsContent>
    </Tabs>
  );
}
