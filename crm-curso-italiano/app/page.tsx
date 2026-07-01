"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock-store";

export default function HomePage() {
  const { persona } = useMockStore();
  const router = useRouter();

  useEffect(() => {
    router.replace(persona ? "/dashboard" : "/login");
  }, [persona, router]);

  return null;
}
