import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";

import { AppShell } from "@/components/layout/AppShell";
import { SidebarProvider } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/auth/login");
    }
  }, [loading, token, router]);

  return (
    <SidebarProvider>
      <AppShell>
        <Stack screenOptions={{ headerShown: false }} />
      </AppShell>
    </SidebarProvider>
  );
}
