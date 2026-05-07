import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Ordering MVP",
  description: "Multi-role food ordering MVP with mocked integrations",
  icons: {
    icon: "https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.ico",
    shortcut: "https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.ico",
    apple: "https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.ico",
  },
};

export const preferredRegion = "hnd1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cause:wght@100..900&family=Cookie&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
