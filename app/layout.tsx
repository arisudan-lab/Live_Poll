// ============================================================================
// Root Layout
// ============================================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
