// ============================================================================
// Transaction Tracking Hook
// ============================================================================

"use client";

import { useTransactionStore } from "@/stores/transaction-store";

/**
 * Hook for accessing transaction tracking state and actions.
 */
export function useTransactions() {
  const store = useTransactionStore();

  return {
    transactions: store.transactions,
    recentTransactions: store.getRecentTransactions(20),
    addTransaction: store.addTransaction,
    clearTransactions: store.clearTransactions,
    pendingCount: store.transactions.filter(
      (tx) => tx.status === "pending"
    ).length,
  };
}
