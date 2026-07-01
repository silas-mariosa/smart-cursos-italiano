"use client";

import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-900 flex items-center justify-center gap-2">
      <Info className="size-4 shrink-0" />
      <span>
        <strong>Modo demonstração</strong> — dados locais, sem servidor
      </span>
    </div>
  );
}
