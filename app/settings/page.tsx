// ============================================================================
// Settings Page
// ============================================================================

"use client";

import { useWallet } from "@/hooks/use-wallet";
import { useWalletStore } from "@/stores/wallet-store";
import { NETWORK_CONFIG, getExplorerAccountUrl } from "@/lib/stellar/config";
import {
  Settings as SettingsIcon,
  Wallet,
  Globe,
  Shield,
  Bell,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTransactionStore } from "@/stores/transaction-store";
import { useEventStore } from "@/stores/event-store";

export default function SettingsPage() {
  const { address, network, balance, disconnect } = useWalletStore();
  const { isConnected } = useWallet();
  const [copied, setCopied] = useState(false);
  const { clearTransactions } = useTransactionStore();
  const { clearEvents } = useEventStore();

  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleClearData = () => {
    clearTransactions();
    clearEvents();
    toast.success("Local data cleared");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
          <SettingsIcon className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage your wallet and application preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Wallet Settings */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--color-primary)]" />
            Wallet Settings
          </h2>

          {isConnected && address ? (
            <div className="space-y-4">
              {/* Connected Wallet */}
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Connected Address
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-[var(--color-text-primary)] font-mono break-all">
                    {address}
                  </code>
                </div>
                {balance && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Balance:{" "}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {balance} XLM
                    </span>
                  </div>
                )}
              </div>

              {/* Network Info */}
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Network
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-primary)] font-medium">
                  {network === "public" ? "Mainnet" : "Testnet"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {NETWORK_CONFIG.networkPassphrase}
                </p>
              </div>

              {/* Explorer Link */}
              <a
                href={getExplorerAccountUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    View on Stellar Expert
                  </span>
                </div>
              </a>

              {/* Disconnect Button */}
              <button
                onClick={disconnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] font-medium transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
              <p className="text-[var(--color-text-primary)] font-medium mb-2">
                No Wallet Connected
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Connect your Stellar wallet to access all features
              </p>
            </div>
          )}
        </div>

        {/* Network Configuration */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-primary)]" />
            Network Configuration
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  RPC Endpoint
                </span>
              </div>
              <code className="text-xs text-[var(--color-text-primary)] font-mono break-all">
                {NETWORK_CONFIG.rpcUrl}
              </code>
            </div>

            <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Contract Address
                </span>
              </div>
              <code className="text-xs text-[var(--color-text-primary)] font-mono break-all">
                {NETWORK_CONFIG.contractId}
              </code>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 opacity-50">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
            Notifications
          </h2>
          
          <div className="text-center py-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Coming soon: Email and push notifications for poll activity
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[var(--color-accent-orange)]" />
            Data Management
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-subtle)]">
              <p className="text-sm text-[var(--color-text-primary)] mb-2">
                Clear Local Data
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                Remove all cached transactions and events from your browser. This
                won't affect on-chain data.
              </p>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cached Data
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            About LivePoll
          </h2>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>
              <span className="font-medium text-[var(--color-text-primary)]">Version:</span> 1.0.0
            </p>
            <p>
              <span className="font-medium text-[var(--color-text-primary)]">Network:</span> Stellar Testnet
            </p>
            <p>
              <span className="font-medium text-[var(--color-text-primary)]">Smart Contract:</span> Soroban (Rust)
            </p>
            <p className="pt-2">
              LivePoll is a decentralized polling platform built on Stellar&apos;s Soroban smart contracts,
              providing transparent and verifiable voting on-chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
