import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageToolbar } from "@/components/layout/page-toolbar";
import { AppProviders } from "@/components/providers/app-providers";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maharashtra Adventures",
  description:
    "Discover, compare, and book trekking, camping, water sports, and adventure trips across Maharashtra.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-(--background) text-slate-900 antialiased">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <PageToolbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <ChatWidget />
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
