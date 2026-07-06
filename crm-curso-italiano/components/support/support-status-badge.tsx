"use client";

import type { SupportConversationStatus } from "@lms-mocks/types";
import { SUPPORT_STATUS_LABELS } from "@lms-mocks/support-conversations";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<SupportConversationStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  waiting_student: "bg-blue-100 text-blue-800",
  waiting_support: "bg-orange-100 text-orange-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-100 text-slate-600",
};

export function SupportStatusBadge({ status }: { status: SupportConversationStatus }) {
  return (
    <Badge className={cn("text-[10px]", STATUS_COLORS[status])}>{SUPPORT_STATUS_LABELS[status]}</Badge>
  );
}
