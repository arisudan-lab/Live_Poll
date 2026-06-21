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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Soroban Smart Contracts
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Decentralized</span>
            <br />
            <span className="gradient-text">Live Polling</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create transparent, verifiable polls on the Stellar blockchain.
            Every vote is recorded on-chain — no manipulation, no censorship,
            just pure democracy.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/polls"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-base shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Vote className="w-5 h-5" />
              Explore Polls
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isConnected ? "View Dashboard" : "Connect Wallet"}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {pollCount ?? "—"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Polls Created</p>
            </div>
            <div className="w-px h-12 bg-white/[0.08]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-zinc-500 mt-1">On-Chain</p>
            </div>
            <div className="w-px h-12 bg-white/[0.08]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">Testnet</p>
              <p className="text-sm text-zinc-500 mt-1">Network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why LivePoll?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
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
                color: "from-indigo-500/20 to-indigo-600/20",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 border border-white/[0.06] group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 p-12 animate-glow">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your First Poll?
            </h2>
            <p className="text-zinc-400 mb-8">
              Connect your wallet, create a poll, and share it with the world.
              It only takes a few seconds.
            </p>
            <Link
              href="/polls"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300"
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
