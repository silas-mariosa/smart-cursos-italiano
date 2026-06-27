"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(api.getToken() ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
