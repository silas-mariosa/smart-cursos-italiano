"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/AppContext";
import { useUiLocale } from "@/lib/context/UiLocaleContext";

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useApp();
  const { t } = useUiLocale();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold">
          {t("app.title")}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
