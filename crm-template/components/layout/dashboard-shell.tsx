"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, User, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    api.removeToken();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/20 p-4 flex flex-col gap-6">
        <div className="font-bold text-lg px-2">CRM Template</div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="outline" className="mt-auto" onClick={logout}>
          <LogOut className="size-4 mr-2" />
          Sair
        </Button>
      </aside>
      <div className="flex-1">
        <header className="border-b px-6 py-4 font-medium">Painel administrativo</header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
