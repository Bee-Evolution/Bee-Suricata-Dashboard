import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matsekasuricata - IDS Dashboard",
  description: "Real-time Intrusion Detection System Dashboard",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ConfigProvider>
          <ConnectionProvider>
            <AuthProvider>
              <SidebarProvider>
                <AuthGuard>{children}</AuthGuard>
              </SidebarProvider>
            </AuthProvider>
          </ConnectionProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
