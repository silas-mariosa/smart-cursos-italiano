"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    void api.getAdminStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total de usuários</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats?.totalUsers ?? "—"}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Administradores</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats?.totalAdmins ?? "—"}</CardContent>
      </Card>
    </div>
  );
}
