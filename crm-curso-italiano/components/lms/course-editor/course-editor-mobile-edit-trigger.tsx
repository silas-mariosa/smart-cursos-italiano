"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Monitor } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  COURSE_EDITOR_MOBILE_DESCRIPTION,
  COURSE_EDITOR_MOBILE_TITLE,
} from "@/lib/course-editor-mobile";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CourseEditorMobileEditTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    href: string;
    children: ReactNode;
  };

export function CourseEditorMobileEditTrigger({
  href,
  children,
  ...buttonProps
}: CourseEditorMobileEditTriggerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <Button asChild {...buttonProps}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <>
      <Button type="button" {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <Monitor className="size-6 text-muted-foreground" />
            </div>
            <DialogTitle className="text-center">{COURSE_EDITOR_MOBILE_TITLE}</DialogTitle>
            <DialogDescription className="text-center">
              {COURSE_EDITOR_MOBILE_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={() => setOpen(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
