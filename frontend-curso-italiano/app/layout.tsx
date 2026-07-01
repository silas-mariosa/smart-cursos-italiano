import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TenantProvider } from "@/lib/context/TenantContext";
import { DemoStudentProvider } from "@/lib/context/DemoStudentContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Studio Italiano — Aprenda italiano online",
  description: "Plataforma de ensino de italiano — MVP demonstração",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <TenantProvider>
          <DemoStudentProvider>{children}</DemoStudentProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
