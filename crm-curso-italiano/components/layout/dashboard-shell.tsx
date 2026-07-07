"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CrmModule } from "@lms-mocks/types";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Dumbbell,
  HelpCircle,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { useMockStore } from "@/lib/mock-store";
import { useTenantPlan } from "@/lib/subscription/use-tenant-plan";
import { DemoBanner } from "@/components/demo-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isCrmCourseWorkspacePath } from "@/lib/editor-routes";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COLLAPSED_KEY = "crm-sidebar-collapsed";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: CrmModule;
  badge?: "corrections" | "support";
  alwaysVisible?: boolean;
};

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard, module: "overview" },
  { href: "/dashboard/cursos", label: "Meus cursos", icon: BookOpen, module: "courses" },
  { href: "/dashboard/ao-vivo", label: "Ao vivo", icon: Video, module: "live" },
  { href: "/dashboard/calendario", label: "Calendário", icon: Calendar, module: "live" },
  { href: "/dashboard/praticar", label: "Prática", icon: Dumbbell, module: "practice" },
  { href: "/dashboard/exercicios", label: "Banco de questões", icon: HelpCircle, module: "exerciseBank" },
  { href: "/dashboard/simulados", label: "Simulados", icon: ClipboardList, module: "mockExams" },
  { href: "/dashboard/correcoes", label: "Correções", icon: ClipboardCheck, module: "corrections", badge: "corrections" },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users, module: "students" },
  { href: "/dashboard/alunos/planos", label: "Planos de alunos", icon: CreditCard, module: "students" },
  { href: "/dashboard/suporte", label: "Suporte", icon: MessageCircle, module: "support", badge: "support" },
  { href: "/dashboard/plano", label: "Meu plano", icon: CreditCard, alwaysVisible: true },
];

const adminNavItem: NavItem = {
  href: "/dashboard/configuracao",
  label: "Configuração",
  icon: Settings,
  alwaysVisible: true,
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
  const isMobile = useIsMobile();
  const { persona, logout, tenant, attempts, supportConversations } = useMockStore();
  const { plan, canAccessModule, canAccessConfiguration, usage } = useTenantPlan();
  const pendingCount = attempts.filter((a) => a.status === "pending").length;
  const supportPending = supportConversations.filter(
    (c) =>
      c.tenantId === tenant.id &&
      (c.status === "open" || c.status === "waiting_support"),
  ).length;

  const navItems = useMemo(() => {
    const items = [...baseNav];
    if (persona?.role === "admin" && canAccessConfiguration) {
      items.push(adminNavItem);
    }
    return items.filter(
      (item) =>
        item.alwaysVisible || (item.module ? canAccessModule(item.module) : true),
    );
  }, [persona?.role, canAccessModule, canAccessConfiguration]);

  const isCourseWorkspace = isCrmCourseWorkspacePath(pathname);
  const activeHref = getActiveNavHref(pathname, navItems);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  function handleLogout() {
    setMobileOpen(false);
    logout();
    router.push("/login");
  }

  const initials = tenant.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  function renderSidebar(collapsedView: boolean, onNavigate?: () => void) {
    return (
      <>
        <div className={cn("flex items-start gap-2", collapsedView ? "flex-col items-center" : "justify-between")}>
          <div className={cn(collapsedView && "flex flex-col items-center")}>
            <div
              className="mb-2 flex size-9 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: tenant.primaryColor }}
              title={collapsedView ? tenant.name : undefined}
            >
              {initials.slice(0, 2)}
            </div>
            {!collapsedView && (
              <>
                <div className="px-1 text-sm font-bold">{tenant.name}</div>
                <div className="px-1 text-xs text-muted-foreground">{persona?.name}</div>
                <Badge variant="outline" className="mt-1 ml-1 text-[10px]">
                  {plan.label}
                </Badge>
              </>
            )}
          </div>
          {!isMobile && (
            <Button
              variant="ghost"
              className={cn("size-8 shrink-0 p-0", collapsedView && "mt-1")}
              onClick={toggleSidebar}
              aria-label={collapsedView ? "Expandir menu" : "Recolher menu"}
            >
              {collapsedView ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </Button>
          )}
        </div>

        {!collapsedView && usage.max !== null && (
          <p className="mt-3 px-1 text-[10px] text-muted-foreground">
            {usage.current}/{usage.max} alunos
          </p>
        )}

        <nav className={cn("mt-6 flex flex-1 flex-col gap-1 overflow-y-auto", collapsedView && "mt-4 items-center")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === activeHref;
            const badgeCount =
              item.badge === "corrections"
                ? pendingCount
                : item.badge === "support"
                  ? supportPending
                  : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsedView ? item.label : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex items-center rounded-md text-sm",
                  collapsedView ? "relative size-9 justify-center px-0" : "gap-2 px-3 py-2",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsedView && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && badgeCount > 0 && (
                      <Badge variant="warning" className="ml-auto text-xs">
                        {badgeCount}
                      </Badge>
                    )}
                  </>
                )}
                {collapsedView && item.badge && badgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-amber-200 text-[10px] font-medium text-amber-900">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="outline"
          className={cn("mt-4 shrink-0", collapsedView && "size-9 px-0 justify-center")}
          onClick={handleLogout}
          title={collapsedView ? "Sair" : undefined}
        >
          <LogOut className={cn("size-4", !collapsedView && "mr-2")} />
          {!collapsedView && "Sair"}
        </Button>
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <DemoBanner />
      <div className="flex flex-1 min-h-0 min-w-0">
        {!isCourseWorkspace && (
          <aside
            className={cn(
              "hidden md:flex shrink-0 flex-col border-r bg-muted/20 transition-[width] duration-300",
              collapsed ? "w-16 p-2" : "w-64 p-4",
            )}
          >
            {renderSidebar(collapsed)}
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col min-h-0">
          {!isCourseWorkspace && (
            <header className="flex shrink-0 items-center gap-3 border-b px-4 py-4 font-medium text-sm text-muted-foreground md:px-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="size-9 shrink-0 px-0 md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir menu"
                >
                  <Menu className="size-4" />
                </Button>
              <span className="min-w-0 truncate">
                Painel {persona?.role === "admin" ? "administrativo" : "do professor"}
              </span>
            </header>
          )}
          <main
            className={cn(
              "flex-1 min-h-0 min-w-0",
              isCourseWorkspace ? "flex flex-col overflow-hidden" : "overflow-auto p-4 md:p-6",
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {!isCourseWorkspace && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="flex w-[min(320px,88vw)] flex-col gap-0 p-4 md:hidden">
            {renderSidebar(false, () => setMobileOpen(false))}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
