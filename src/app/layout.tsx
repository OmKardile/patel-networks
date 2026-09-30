import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Patel Networks — CCTV, Surveillance & Networking Hardware",
    template: "%s · Patel Networks",
  },
  description:
    "Authorized distributor of Hikvision, Dahua, CP Plus, D-Link and more. CCTV cameras, DVR/NVR, cables, connectors and optical networking hardware with GST invoices and pan-India delivery from Surat, Gujarat.",
  keywords: ["CCTV", "surveillance", "Hikvision", "CP Plus", "Dahua", "DVR", "NVR", "networking", "Surat", "Patel Networks"],
  openGraph: {
    title: "Patel Networks — CCTV & Networking Hardware",
    description: "Surveillance and structured networking hardware, delivered India-wide with GST invoices.",
    siteName: "Patel Networks",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {/* Manual light/dark switch (class strategy). Light is the brand-default
            Neeman's-class warm theme; the toggle in the storefront header + admin
            chrome flips the forest-night theme. suppressHydrationWarning is on <html>. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
