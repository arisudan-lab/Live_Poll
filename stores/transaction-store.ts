// ============================================================================
// Transaction Tracking Store (Zustand)
// ============================================================================

import { create } from "zustand";
import {
  TransactionRecord,
  TransactionStatus,
  TransactionType,
} from "@/types";
import { getExplorerTxUrl } from "@/lib/stellar/config";
import { waitForConfirmation } from "@/lib/stellar/transaction";

interface TransactionStore {
  transactions: TransactionRecord[];
  addTransaction: (
    hash: string,
    type: TransactionType,
    description: string
  ) => void;
  updateTransaction: (
    hash: string,
    updates: Partial<TransactionRecord>
  ) => void;
  trackTransaction: (hash: string) => Promise<TransactionStatus>;
  getRecentTransactions: (limit?: number) => TransactionRecord[];
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  addTransaction: (hash, type, description) => {
    const record: TransactionRecord = {
      hash,
      status: TransactionStatus.Pending,
      type,
      explorerLink: getExplorerTxUrl(hash),
      timestamp: Math.floor(Date.now() / 1000),
      description,
    };

    set((state) => ({
      transactions: [record, ...state.transactions],
    }));

    // Automatically start tracking
    get().trackTransaction(hash);
  },

  updateTransaction: (hash, updates) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    }));
  },

  trackTransaction: async (hash) => {
    const { status } = await waitForConfirmation(hash);

    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash
          ? {
              ...tx,
              status,
              errorMessage:
                status === TransactionStatus.Failed
                  ? "Transaction failed on-chain"
                  : undefined,
            }
          : tx
      ),
    }));

    return status;
  },

  getRecentTransactions: (limit = 20) => {
    return get().transactions.slice(0, limit);
  },

  clearTransactions: () => set({ transactions: [] }),
}));
