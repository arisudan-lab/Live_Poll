// ============================================================================
// Home Page
// ============================================================================

"use client";

import Link from "next/link";
import { usePollCount } from "@/hooks/use-polls";
import { useWallet } from "@/hooks/use-wallet";
import {
  Vote,
  Shield,
  Zap,
  Globe,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  Eye,
} from "lucide-react";

export default function HomePage() {
  const { data: pollCount } = usePollCount();
  const { isConnected } = useWallet();

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[var(--color-bg)] -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Soroban Smart Contracts
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-[var(--color-text-primary)]">Decentralized</span>
            <br />
            <span className="text-[var(--color-primary)]">Live Polling</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Create transparent, verifiable polls on the Stellar blockchain.
            Every vote is recorded on-chain — no manipulation, no censorship,
            just pure democracy.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/polls"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-text-primary)] font-semibold text-base transition-all duration-200"
            >
              <Vote className="w-5 h-5" />
              Explore Polls
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-bg)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] font-semibold text-base transition-all duration-200"
            >
              {isConnected ? "View Dashboard" : "Connect Wallet"}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                {pollCount ?? "—"}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Polls Created</p>
            </div>
            <div className="w-px h-12 bg-[var(--color-border-subtle)]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">100%</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">On-Chain</p>
            </div>
            <div className="w-px h-12 bg-[var(--color-border-subtle)]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">Testnet</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 border-t border-[var(--color-border-subtle)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Why LivePoll?
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Built on Stellar&apos;s fast, low-cost blockchain with Soroban smart
              contracts for maximum transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Tamper-Proof",
                description:
                  "Every vote is immutably recorded on the Stellar blockchain. No one can alter results after submission.",
                color: "from-violet-500/20 to-violet-600/20",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Stellar's 5-second finality means your votes are confirmed almost instantly. No waiting for block confirmations.",
                color: "from-cyan-500/20 to-cyan-600/20",
              },
              {
                icon: Globe,
                title: "Globally Accessible",
                description:
                  "Anyone with a Stellar wallet can create polls and vote. No geographic restrictions, no gatekeepers.",
                color: "from-emerald-500/20 to-emerald-600/20",
              },
              {
                icon: Eye,
                title: "Real-Time Results",
                description:
                  "Watch votes come in live. Our event system syncs directly with the blockchain for instant updates.",
                color: "from-amber-500/20 to-amber-600/20",
              },
              {
                icon: BarChart3,
                title: "Rich Analytics",
                description:
                  "Visualize poll results with animated progress bars and percentage breakdowns in real time.",
                color: "from-rose-500/20 to-rose-600/20",
              },
              {
                icon: Users,
                title: "Multi-Wallet",
                description:
                  "Connect with Freighter, xBull, Albedo, or any Stellar-compatible wallet via StellarWalletsKit.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 hover:bg-[var(--color-bg)] transition-all duration-200"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-[var(--color-bg)] flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]`}
                  >
                    <Icon className="w-6 h-6 text-[var(--color-text-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 border-t border-[var(--color-border-subtle)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-12">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Ready to Create Your First Poll?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Connect your wallet, create a poll, and share it with the world.
              It only takes a few seconds.
            </p>
            <Link
              href="/polls"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-text-primary)] font-semibold transition-all duration-200"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
