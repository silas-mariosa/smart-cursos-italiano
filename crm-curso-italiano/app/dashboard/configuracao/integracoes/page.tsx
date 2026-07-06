import Link from "next/link";
import { IntegrationConfigPanel } from "@/components/integrations/integration-config-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plug } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/configuracao"
          className={cn(buttonVariants({ variant: "ghost" }), "px-0 h-auto text-sm mb-2")}
        >
          ← Configuração
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="size-7 text-primary" />
          Integrações
        </h1>
        <p className="text-muted-foreground mt-1">
          Conecte Kiwify ou Hotmart para matricular alunos automaticamente após a compra (demo mock).
        </p>
      </div>
      <IntegrationConfigPanel />
    </div>
  );
}
