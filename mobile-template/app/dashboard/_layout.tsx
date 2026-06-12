import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/auth/login");
    }
  }, [loading, token, router]);

  return <Stack screenOptions={{ headerShown: true, title: "Dashboard" }} />;
}
