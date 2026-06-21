// ============================================================================
// Wallet Info Card Component
// ============================================================================

"use client";

import { useWallet } from "@/hooks/use-wallet";
import {
  truncateAddress,
  getExplorerAccountUrl,
  NETWORK_CONFIG,
} from "@/lib/stellar/config";
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  Globe,
  CircleDollarSign,
} from "lucide-react";
import { toast } from "sonner";

export function WalletInfo() {
  const { address, isConnected, balance, network, refreshBalance } =
    useWallet();

  if (!isConnected || !address) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-white/[0.08]">
          <Wallet className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Wallet Connected
        </h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Connect your Stellar wallet to view your account details, check your
          balance, and interact with polls.
        </p>
      </div>
    );
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header gradient */}
      <div className="h-24 bg-gradient-to-r from-violet-600/30 via-cyan-600/20 to-violet-600/30 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
      </div>

      <div className="px-6 pb-6 -mt-8">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 border-4 border-zinc-950 flex items-center justify-center mb-4 shadow-lg">
          <Wallet className="w-7 h-7 text-white" />
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-lg font-mono font-semibold text-white">
            {truncateAddress(address, 6)}
          </h3>
          <button
            onClick={copyAddress}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            title="Copy address"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={getExplorerAccountUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <CircleDollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Balance</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">
                {balance || "—"}{" "}
                <span className="text-sm text-zinc-400">XLM</span>
              </p>
              <button
                onClick={refreshBalance}
                className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors"
                title="Refresh balance"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">Network</span>
            </div>
            <p className="text-lg font-semibold text-white capitalize">
              {network}
            </p>
          </div>

          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">RPC</span>
            </div>
            <p className="text-xs font-mono text-zinc-300 truncate">
              {NETWORK_CONFIG.rpcUrl.replace("https://", "")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
