// ============================================================================
// Transaction History Page
// ============================================================================

"use client";

import { useTransactions } from "@/hooks/use-transactions";
import { TransactionList } from "@/components/transactions/transaction-list";
import { EmptyState } from "@/components/ui/empty-state";
import { History, Trash2 } from "lucide-react";

export default function TransactionsPage() {
  const { transactions, clearTransactions, pendingCount } = useTransactions();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
            <History className="w-5 h-5 text-[var(--color-accent-orange)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Transaction History
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {transactions.length > 0
                ? `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}${
                    pendingCount > 0 ? ` (${pendingCount} pending)` : ""
                  }`
                : "Your recent contract interactions"}
            </p>
          </div>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={clearTransactions}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-bg)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Transaction List */}
      {transactions.length > 0 ? (
        <TransactionList transactions={transactions} />
      ) : (
        <EmptyState
          icon={<History className="w-7 h-7 text-[var(--color-text-secondary)]" />}
          title="No transactions yet"
          description="When you create polls, vote, or close polls, your transactions will be tracked here with their status and explorer links."
        />
      )}
    </div>
  );
}
