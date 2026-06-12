import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/lib/context/AppContext";
import { UiLocaleProvider } from "@/lib/context/UiLocaleContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frontend Template",
  description: "Template Next.js com auth, i18n e API centralizada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppProvider>
          <UiLocaleProvider>{children}</UiLocaleProvider>
        </AppProvider>
      </body>
    </html>
  );
}
