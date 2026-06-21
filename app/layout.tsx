// ============================================================================
// Root Layout
// ============================================================================

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LivePoll — Decentralized Polling on Stellar",
  description:
    "Create and vote on live polls powered by Soroban smart contracts on the Stellar blockchain. Transparent, verifiable, and real-time.",
  keywords: [
    "Stellar",
    "Soroban",
    "DApp",
    "Polling",
    "Voting",
    "Blockchain",
    "Decentralized",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[var(--color-bg)] text-[var(--color-text-primary)] antialiased tracking-normal leading-relaxed`}>
        <Providers>
          <div className="min-h-screen flex flex-col mx-auto max-w-7xl">
            <Header />
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
