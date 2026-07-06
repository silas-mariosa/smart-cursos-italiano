"use client";

import Link from "next/link";
import { Radio, ArrowRight } from "lucide-react";
import type { LiveSession } from "@lms-mocks/practice-types";
import { getLiveSessionJoinHref } from "@/lib/live/student-live-utils";
import { Button } from "@/components/ui/button";

interface LiveNowBannerProps {
  session: LiveSession;
  tenantSlug: string;
}

export function LiveNowBanner({ session, tenantSlug }: LiveNowBannerProps) {
  const isLive = session.status === "live";
  const joinHref = getLiveSessionJoinHref(tenantSlug, session);

  return (
    <div
      className={
        isLive
          ? "relative overflow-hidden rounded-xl border border-red-300 bg-gradient-to-r from-red-600 to-red-500 p-6 text-white shadow-lg"
          : "relative overflow-hidden rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm"
      }
    >
      {isLive && (
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
      )}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isLive ? "bg-white/20 text-white" : "bg-red-600 text-white"
              }`}
            >
              <Radio className={`size-3 ${isLive ? "animate-pulse" : ""}`} />
              {isLive ? "AO VIVO AGORA" : "SALA ABERTA — CONVOCADO"}
            </span>
          </div>
          <h2 className={`text-xl font-bold ${isLive ? "text-white" : "text-foreground"}`}>
            {session.title}
          </h2>
          <p className={`text-sm ${isLive ? "text-white/90" : "text-muted-foreground"}`}>
            {session.courseTitle} · com {session.instructorName}
          </p>
        </div>
        <Link href={joinHref} className="shrink-0">
          <Button
            size="lg"
            className={
              isLive
                ? "bg-white text-red-600 hover:bg-white/90 font-semibold shadow-md"
                : "bg-red-600 hover:bg-red-700 text-white font-semibold"
            }
          >
            {isLive ? "Participar agora" : "Entrar na sala"}
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
