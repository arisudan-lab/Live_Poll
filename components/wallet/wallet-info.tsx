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
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-border-subtle)]">
          <Wallet className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          No Wallet Connected
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
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
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header gradient */}
      <div className="h-24 bg-[var(--color-bg)] border-b border-[var(--color-border-subtle)] relative" />

      <div className="px-6 pb-6 -mt-8">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] border-4 border-[var(--color-surface)] flex items-center justify-center mb-4 shadow-sm">
          <Wallet className="w-7 h-7 text-white" />
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-lg font-mono font-semibold text-[var(--color-text-primary)]">
            {truncateAddress(address, 6)}
          </h3>
          <button
            onClick={copyAddress}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            title="Copy address"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={getExplorerAccountUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
              <CircleDollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Balance</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {balance || "—"}{" "}
                <span className="text-sm text-[var(--color-text-secondary)]">XLM</span>
              </p>
              <button
                onClick={refreshBalance}
                className="p-1 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Refresh balance"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">Network</span>
            </div>
            <p className="text-lg font-semibold text-[var(--color-text-primary)] capitalize">
              {network}
            </p>
          </div>

          <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">RPC</span>
            </div>
            <p className="text-xs font-mono text-[var(--color-text-secondary)] truncate">
              {NETWORK_CONFIG.rpcUrl.replace("https://", "")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
