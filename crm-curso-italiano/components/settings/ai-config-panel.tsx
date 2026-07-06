"use client";

import { useEffect, useState } from "react";
import type { TenantAiConfig } from "@lms-mocks/types";
import { useMockStore } from "@/lib/mock-store";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

const AI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini (recomendado)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
] as const;

function getStatusBadge(aiConfig: TenantAiConfig, canUse: boolean) {
  if (canUse) {
    return { label: "Ativo", variant: "default" as const };
  }
  if (aiConfig.apiKey.trim() && aiConfig.lastValidatedAt) {
    return { label: "Configurado", variant: "secondary" as const };
  }
  return { label: "Não configurado", variant: "outline" as const };
}

export function AiConfigPanel() {
  const { aiConfig, setAiConfig, testAiConnection } = useMockStore();
  const { canUseAiGeneration } = useTenantPlan();

  const [form, setForm] = useState<TenantAiConfig>(aiConfig);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    setForm(aiConfig);
  }, [aiConfig]);

  const status = getStatusBadge(form, canUseAiGeneration);

  function updateField<K extends keyof TenantAiConfig>(key: K, value: TenantAiConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTestSuccess(false);
    setTestError(null);
  }

  function handleSave() {
    setAiConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestError(null);
    setTestSuccess(false);
    const result = await testAiConnection(form);
    setTesting(false);
    if (result.error || !result.data) {
      setTestError(result.error ?? "Falha na conexão");
      return;
    }
    setForm(result.data);
    setTestSuccess(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900 flex gap-2">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <p>
          Modo demonstração — a chave fica no navegador. Em produção será criptografada no servidor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Integração ChatGPT
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Chave da API OpenAI</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={form.apiKey}
              onChange={(e) => updateField("apiKey", e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cada escola usa sua própria chave (BYOK). Obtenha em platform.openai.com
            </p>
          </div>

          <div>
            <Label htmlFor="baseUrl">URL base da API</Label>
            <Input
              id="baseUrl"
              type="url"
              value={form.baseUrl}
              onChange={(e) => updateField("baseUrl", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="model">Modelo</Label>
            <select
              id="model"
              value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
              className={cn(
                "flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
              )}
            >
              {AI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="enabled"
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => updateField("enabled", e.target.checked)}
              className="size-4 rounded border"
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Ativar geração com ChatGPT
            </Label>
          </div>

          {form.lastValidatedAt && (
            <p className="text-xs text-muted-foreground">
              Última validação: {new Date(form.lastValidatedAt).toLocaleString("pt-BR")}
            </p>
          )}

          {testError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="size-4 shrink-0" />
              {testError}
            </p>
          )}

          {testSuccess && (
            <p className="text-sm text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="size-4 shrink-0" />
              Conexão validada com sucesso (simulada).
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave}>Salvar alterações</Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={testing || !form.apiKey.trim()}>
              {testing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar conexão"
              )}
            </Button>
            {saved && <span className="text-sm text-emerald-600 self-center">Salvo!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
