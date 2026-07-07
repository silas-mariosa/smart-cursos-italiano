"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Video, Dumbbell, UserCircle, ClipboardList } from "lucide-react";
import { useTenant } from "@/lib/context/TenantContext";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { useActiveLiveSession } from "@/lib/hooks/useLiveSessions";
import { DemoBanner } from "@/components/demo-banner";
import { ImmersiveBackHeader } from "@/components/layout/immersive-back-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCourseImmersiveBack, isCourseImmersivePath } from "@/lib/course-navigation";
import { cn } from "@/lib/utils";

export function StudentShell({
  children,
  tenantSlug,
}: {
  children: React.ReactNode;
  tenantSlug: string;
}) {
  const { tenant } = useTenant();
  const { persona, logout, canAccessFeature } = useDemoStudent();
  const router = useRouter();
  const pathname = usePathname();
  const liveSession = useActiveLiveSession();

  function handleLogout() {
    logout();
    router.push(`/${tenantSlug}/auth/login`);
  }

  const courseImmersive = isCourseImmersivePath(pathname);
  const courseBack = courseImmersive ? getCourseImmersiveBack(pathname) : null;

  const nav = [
    { href: `/${tenantSlug}/dashboard`, label: "Início", icon: LayoutDashboard },
    ...(canAccessFeature("exerciseBank")
      ? [{ href: `/${tenantSlug}/praticar`, label: "Praticar", icon: Dumbbell }]
      : []),
    ...(canAccessFeature("liveParticipation")
      ? [{ href: `/${tenantSlug}/ao-vivo`, label: "Ao vivo", icon: Video, badge: liveSession?.status === "waiting" || liveSession?.status === "live" }]
      : []),
    ...(canAccessFeature("mockExams")
      ? [{ href: `/${tenantSlug}/simulados`, label: "Simulados", icon: ClipboardList }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      {courseImmersive && courseBack ? (
        <ImmersiveBackHeader href={courseBack.href} label={courseBack.label} />
      ) : (
        <header className="border-b bg-background">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
            <Link href={`/${tenantSlug}/dashboard`} className="flex items-center gap-2 font-semibold shrink-0">
              <div
                className="flex size-8 items-center justify-center rounded-md text-white text-xs font-bold"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                SI
              </div>
              <span className="hidden sm:inline truncate max-w-[8rem] md:max-w-none">{tenant.name}</span>
            </Link>

            <nav className="flex flex-1 items-center justify-center gap-0.5 sm:gap-1 min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-md text-sm transition-colors shrink-0",
                      active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="hidden md:inline">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-600 text-white border-0 text-[10px] px-1.5 py-0 h-4 animate-pulse">
                        !
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link href={`/${tenantSlug}/minha-conta`} className="flex items-center gap-2 text-sm hover:opacity-80" title="Minha conta">
                <UserCircle className="size-5 md:hidden text-muted-foreground" />
                <Avatar className="size-8 hidden md:flex">
                  <AvatarFallback>{persona?.avatar ?? "?"}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline text-sm">{persona?.name?.split(" ")[0]}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sair">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>
      )}
      <main className={cn("flex-1", courseImmersive && "flex min-h-0 flex-col")}>{children}</main>
    </div>
  );
}
