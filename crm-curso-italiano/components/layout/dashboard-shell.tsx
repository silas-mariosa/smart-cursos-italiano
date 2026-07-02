"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CrmModule } from "@lms-mocks/types";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Palette,
  Users,
  Video,
} from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isLessonEditorPath } from "@/lib/editor-routes";

const SIDEBAR_COLLAPSED_KEY = "crm-sidebar-collapsed";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: CrmModule;
  badge?: boolean;
  alwaysVisible?: boolean;
};

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard, module: "overview" },
  { href: "/dashboard/cursos", label: "Meus cursos", icon: BookOpen, module: "courses" },
  { href: "/dashboard/ao-vivo", label: "Ao vivo", icon: Video, module: "live" },
  { href: "/dashboard/praticar", label: "Prática", icon: Dumbbell, module: "practice" },
  { href: "/dashboard/exercicios", label: "Banco de questões", icon: HelpCircle, module: "exerciseBank" },
  { href: "/dashboard/correcoes", label: "Correções", icon: ClipboardCheck, module: "corrections", badge: true },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users, module: "students" },
  { href: "/dashboard/plano", label: "Meu plano", icon: CreditCard, alwaysVisible: true },
];

const adminNavItem: NavItem = {
  href: "/dashboard/configuracao",
  label: "Configuração",
  icon: Palette,
  module: "branding",
};

function getActiveNavHref(pathname: string, navItems: NavItem[]) {
  const matches = navItems.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { persona, logout, tenant, attempts } = useMockStore();
  const { plan, canAccessModule, usage } = useTenantPlan();
  const pendingCount = attempts.filter((a) => a.status === "pending").length;

  const navItems = useMemo(() => {
    const items = [...baseNav];
    if (persona?.role === "admin") {
      items.push(adminNavItem);
    }
    return items.filter(
      (item) =>
        item.alwaysVisible || (item.module ? canAccessModule(item.module) : true),
    );
  }, [persona?.role, canAccessModule]);

  const isLessonEditor = isLessonEditorPath(pathname);
  const activeHref = getActiveNavHref(pathname, navItems);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = tenant.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <DemoBanner />
      <div className="flex flex-1 min-h-0">
        {!isLessonEditor && (
        <aside
          className={cn(
            "flex shrink-0 flex-col border-r bg-muted/20 transition-[width] duration-300",
            collapsed ? "w-16 p-2" : "w-64 p-4",
          )}
        >
          <div className={cn("flex items-start gap-2", collapsed ? "flex-col items-center" : "justify-between")}>
            <div className={cn(collapsed && "flex flex-col items-center")}>
              <div
                className="mb-2 flex size-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: tenant.primaryColor }}
                title={collapsed ? tenant.name : undefined}
              >
                {initials.slice(0, 2)}
              </div>
              {!collapsed && (
                <>
                  <div className="px-1 text-sm font-bold">{tenant.name}</div>
                  <div className="px-1 text-xs text-muted-foreground">{persona?.name}</div>
                  <Badge variant="outline" className="mt-1 ml-1 text-[10px]">
                    {plan.label}
                  </Badge>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              className={cn("size-8 shrink-0 p-0", collapsed && "mt-1")}
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </Button>
          </div>

          {!collapsed && usage.max !== null && (
            <p className="mt-3 px-1 text-[10px] text-muted-foreground">
              {usage.current}/{usage.max} alunos
            </p>
          )}

          <nav className={cn("mt-6 flex flex-1 flex-col gap-1 overflow-y-auto", collapsed && "mt-4 items-center")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md text-sm",
                    collapsed ? "relative size-9 justify-center px-0" : "gap-2 px-3 py-2",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge && pendingCount > 0 && (
                        <Badge variant="warning" className="ml-auto text-xs">
                          {pendingCount}
                        </Badge>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && pendingCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-amber-200 text-[10px] font-medium text-amber-900">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <Button
            variant="outline"
            className={cn("mt-4 shrink-0", collapsed && "size-9 px-0 justify-center")}
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className={cn("size-4", !collapsed && "mr-2")} />
            {!collapsed && "Sair"}
          </Button>
        </aside>
        )}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {!isLessonEditor && (
            <header className="border-b px-6 py-4 font-medium text-sm text-muted-foreground shrink-0">
              Painel {persona?.role === "admin" ? "administrativo" : "do professor"}
            </header>
          )}
          <main
            className={cn(
              "flex-1 min-h-0",
              isLessonEditor ? "flex flex-col overflow-hidden" : "p-6 overflow-auto",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
