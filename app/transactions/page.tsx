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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/[0.08]">
            <History className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Transaction History
            </h1>
            <p className="text-sm text-zinc-400">
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-zinc-400 hover:text-white transition-all"
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
          icon={<History className="w-7 h-7 text-amber-400" />}
          title="No transactions yet"
          description="When you create polls, vote, or close polls, your transactions will be tracked here with their status and explorer links."
        />
      )}
    </div>
  );
}
