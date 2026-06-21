// ============================================================================
// Wallet Dashboard Page
// ============================================================================

"use client";

import { WalletInfo } from "@/components/wallet/wallet-info";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionList } from "@/components/transactions/transaction-list";
import { EmptyState } from "@/components/ui/empty-state";
import { ConnectButton } from "@/components/wallet/connect-button";
import { NETWORK_CONFIG } from "@/lib/stellar/config";
import {
  LayoutDashboard,
  History,
  Globe,
  Server,
  Shield,
} from "lucide-react";

export default function DashboardPage() {
  const { isConnected } = useWallet();
  const { recentTransactions } = useTransactions();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
          <LayoutDashboard className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage your wallet and view recent activity
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Wallet Card */}
        <WalletInfo />

        {/* Network Info */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[var(--color-primary)]" />
            Network Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg)]">
              <Server className="w-4 h-4 text-[var(--color-text-secondary)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">RPC Endpoint</p>
                <p className="text-sm text-[var(--color-text-primary)] font-mono break-all">
                  {NETWORK_CONFIG.rpcUrl}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg)]">
              <Shield className="w-4 h-4 text-[var(--color-text-secondary)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Network Passphrase</p>
                <p className="text-sm text-[var(--color-text-primary)] font-mono break-all">
                  {NETWORK_CONFIG.networkPassphrase}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg)]">
              <Globe className="w-4 h-4 text-[var(--color-text-secondary)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Explorer</p>
                <a
                  href={NETWORK_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-primary)] hover:brightness-110 transition-colors"
                >
                  {NETWORK_CONFIG.explorerUrl}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg)]">
              <Shield className="w-4 h-4 text-[var(--color-text-secondary)] mt-0.5" />
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Contract ID</p>
                <p className="text-sm text-[var(--color-text-primary)] font-mono break-all">
                  {NETWORK_CONFIG.contractId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--color-accent-orange)]" />
            Recent Transactions
          </h2>
          {recentTransactions.length > 0 ? (
            <TransactionList
              transactions={recentTransactions.slice(0, 5)}
            />
          ) : (
            <EmptyState
              icon={<History className="w-7 h-7 text-[var(--color-text-secondary)]" />}
              title="No transactions yet"
              description={
                isConnected
                  ? "Your contract transactions will appear here."
                  : "Connect your wallet and start interacting with polls."
              }
              action={!isConnected ? <ConnectButton /> : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
