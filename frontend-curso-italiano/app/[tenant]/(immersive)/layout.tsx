"use client";

import { ImmersiveGuard } from "@/components/layout/immersive-guard";

export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return <ImmersiveGuard>{children}</ImmersiveGuard>;
}
