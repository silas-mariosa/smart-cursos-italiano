import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type AppNavItem = {
  href: "/dashboard";
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export const APP_NAV: AppNavItem[] = [
  { href: "/dashboard", label: "Início", icon: "home-outline" },
];

export function getHeaderTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "Início";
  }
  return "Curso Italiano";
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
