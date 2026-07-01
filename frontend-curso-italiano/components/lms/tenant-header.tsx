"use client";

import Link from "next/link";
import { useTenant } from "@/lib/context/TenantContext";
import { Button } from "@/components/ui/button";

export function TenantHeader({
  tenantSlug,
  showAuth = true,
}: {
  tenantSlug: string;
  showAuth?: boolean;
}) {
  const { tenant } = useTenant();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={`/${tenantSlug}`} className="flex items-center gap-3 font-semibold text-lg">
          <div
            className="flex size-9 items-center justify-center rounded-lg text-white text-sm font-bold"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            SI
          </div>
          {tenant.name}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href={`/${tenantSlug}#cursos`} className="hover:text-foreground">
            Cursos
          </Link>
          <Link href={`/${tenantSlug}#sobre`} className="hover:text-foreground">
            Sobre
          </Link>
        </nav>
        {showAuth && (
          <div className="flex items-center gap-2">
            <Link href={`/${tenantSlug}/auth/login`}>
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
            <Link href={`/${tenantSlug}/auth/login`}>
              <Button size="sm">Comece agora</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
