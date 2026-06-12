"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/context/AppContext";
import { useUiLocale } from "@/lib/context/UiLocaleContext";

export default function DashboardPage() {
  const { user } = useApp();
  const { t } = useUiLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("nav.dashboard")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{t("dashboard.welcome", { name: user?.name ?? "" })}</p>
        <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
      </CardContent>
    </Card>
  );
}
