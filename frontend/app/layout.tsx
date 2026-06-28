import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { NotificationContainer } from "@/components/shared/NotificationContainer";

export const metadata: Metadata = {
  title: "AWS Route53 Clone",
  description: "A production-grade AWS Route53 DNS management clone with full CRUD for hosted zones and DNS records",
  keywords: ["AWS", "Route53", "DNS", "Hosted Zones", "DNS Records"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <NotificationContainer />
        </Providers>
      </body>
    </html>
  );
}
