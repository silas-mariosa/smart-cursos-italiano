"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Palette,
  Users,
  Video,
} from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const teacherNav = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/cursos", label: "Meus cursos", icon: BookOpen },
  { href: "/dashboard/ao-vivo", label: "Ao vivo", icon: Video },
  { href: "/dashboard/praticar", label: "Prática", icon: Dumbbell },
  { href: "/dashboard/exercicios", label: "Banco de questões", icon: HelpCircle },
  { href: "/dashboard/correcoes", label: "Correções", icon: ClipboardCheck, badge: true },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users },
];

const adminNav = [...teacherNav, { href: "/dashboard/configuracao", label: "Configuração", icon: Palette }];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { persona, logout, tenant, attempts } = useMockStore();
  const pendingCount = attempts.filter((a) => a.status === "pending").length;
  const navItems = persona?.role === "admin" ? adminNav : teacherNav;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/20 p-4 flex flex-col gap-6 shrink-0">
          <div>
            <div
              className="flex size-9 items-center justify-center rounded-lg text-white text-xs font-bold mb-2"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              SI
            </div>
            <div className="font-bold text-sm px-1">{tenant.name}</div>
            <div className="text-xs text-muted-foreground px-1">{persona?.name}</div>
          </div>
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
                  {"badge" in item && item.badge && pendingCount > 0 && (
                    <Badge variant="warning" className="ml-auto text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <Button variant="outline" className="mt-auto" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Sair
          </Button>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b px-6 py-4 font-medium text-sm text-muted-foreground">
            Painel {persona?.role === "admin" ? "administrativo" : "do professor"}
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
