import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MockStoreProvider } from "@/lib/mock-store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS — Painel da escola",
  description: "CRM professor/admin — MVP demonstração",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <MockStoreProvider>{children}</MockStoreProvider>
      </body>
    </html>
  );
}
