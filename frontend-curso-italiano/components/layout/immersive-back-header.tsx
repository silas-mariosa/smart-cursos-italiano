import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ImmersiveBackHeader({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <header className="shrink-0 border-b bg-background">
      <div className="flex h-10 items-center px-4">
        <Link
          href={href}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 gap-1 max-w-full")}
        >
          <ChevronLeft className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      </div>
    </header>
  );
}
