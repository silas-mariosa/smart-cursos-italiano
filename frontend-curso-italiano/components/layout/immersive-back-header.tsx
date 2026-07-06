import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button variant="ghost" size="sm" className="-ml-2 gap-1" asChild>
          <Link href={href}>
            <ChevronLeft className="size-4" />
            {label}
          </Link>
        </Button>
      </div>
    </header>
  );
}
