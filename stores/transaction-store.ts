// ============================================================================
// Transaction Tracking Store with Complete Lifecycle Management
// ============================================================================

import { create } from "zustand";
import {
  TransactionRecord,
  TransactionStatus,
  TransactionType,
} from "@/types";
import { getExplorerTxUrl } from "@/lib/stellar/config";
import { waitForConfirmation } from "@/lib/stellar/transaction";

// Maximum number of transactions to keep in history
const MAX_TRANSACTIONS = 100;

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

interface TransactionStore {
  transactions: TransactionRecord[];
  pendingCount: number;
  
  // Add/Update transactions
  addTransaction: (
    hash: string,
    type: TransactionType,
    description: string
  ) => void;
  
  updateTransaction: (
    hash: string,
    updates: Partial<TransactionRecord>
  ) => void;
  
  // Mark transaction as processing
  markAsProcessing: (hash: string) => void;
  
  // Mark transaction as confirmed
  markAsConfirmed: (hash: string, ledger?: number) => void;
  
  // Mark transaction as failed
  markAsFailed: (hash: string, errorMessage: string) => void;
  
  // Track transaction with retry logic
  trackTransaction: (hash: string) => Promise<TransactionStatus>;
  
  // Retry a failed transaction
  retryTransaction: (hash: string) => Promise<void>;
  
  // Get transactions by status
  getTransactionsByStatus: (status: TransactionStatus) => TransactionRecord[];
  
  // Get recent transactions
  getRecentTransactions: (limit?: number) => TransactionRecord[];
  
  // Get pending transactions
  getPendingTransactions: () => TransactionRecord[];
  
  // Clear all transactions
  clearTransactions: () => void;
  
  // Clear failed transactions only
  clearFailedTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  pendingCount: 0,

  addTransaction: (hash, type, description) => {
    const record: TransactionRecord = {
      hash,
      status: TransactionStatus.Pending,
      type,
      explorerLink: getExplorerTxUrl(hash),
      timestamp: Math.floor(Date.now() / 1000),
      description,
      retryCount: 0,
    };

    set((state) => {
      const newTransactions = [record, ...state.transactions].slice(0, MAX_TRANSACTIONS);
      const newPendingCount = newTransactions.filter(
        (tx) => tx.status === TransactionStatus.Pending
      ).length;
      
      return {
        transactions: newTransactions,
        pendingCount: newPendingCount,
      };
    });

    // Automatically start tracking
    get().trackTransaction(hash);
  },

  updateTransaction: (hash, updates) => {
    set((state) => {
      const updatedTransactions = state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      );
      
      const newPendingCount = updatedTransactions.filter(
        (tx) => tx.status === TransactionStatus.Pending
      ).length;
      
      return {
        transactions: updatedTransactions,
        pendingCount: newPendingCount,
      };
    });
  },

  markAsProcessing: (hash: string) => {
    get().updateTransaction(hash, {
      status: TransactionStatus.Pending,
    });
  },

  markAsConfirmed: (hash: string, ledger?: number) => {
    get().updateTransaction(hash, {
      status: TransactionStatus.Success,
      confirmedAt: Math.floor(Date.now() / 1000),
      ledger,
    });
  },

  markAsFailed: (hash: string, errorMessage: string) => {
    get().updateTransaction(hash, {
      status: TransactionStatus.Failed,
      errorMessage,
      failedAt: Math.floor(Date.now() / 1000),
    });
  },

  trackTransaction: async (hash) => {
    const { updateTransaction, markAsConfirmed, markAsFailed } = get();
    
    try {
      updateTransaction(hash, { status: TransactionStatus.Pending });
      
      const result = await waitForConfirmation(hash);
      
      if (result.status === TransactionStatus.Success) {
        markAsConfirmed(hash, result.ledger);
      } else {
        markAsFailed(hash, result.error || "Transaction failed on-chain");
      }
      
      return result.status;
    } catch (error) {
      console.error(`[Transaction] Tracking failed for ${hash}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      markAsFailed(hash, errorMessage);
      
      return TransactionStatus.Failed;
    }
  },

  retryTransaction: async (hash: string) => {
    const { transactions, trackTransaction, updateTransaction } = get();
    const transaction = transactions.find((tx) => tx.hash === hash);
    
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    if (transaction.retryCount >= MAX_RETRY_ATTEMPTS) {
      throw new Error("Max retry attempts reached");
    }
    
    // Increment retry count
    updateTransaction(hash, {
      retryCount: (transaction.retryCount || 0) + 1,
      lastRetryAt: Math.floor(Date.now() / 1000),
      status: TransactionStatus.Pending,
      errorMessage: undefined,
    });
    
    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    
    // Retry tracking
    await trackTransaction(hash);
  },

  getTransactionsByStatus: (status: TransactionStatus) => {
    return get().transactions.filter((tx) => tx.status === status);
  },

  getRecentTransactions: (limit = 20) => {
    return get().transactions.slice(0, limit);
  },

  getPendingTransactions: () => {
    return get().transactions.filter(
      (tx) => tx.status === TransactionStatus.Pending
    );
  },

  clearTransactions: () => {
    set({ transactions: [], pendingCount: 0 });
  },

  clearFailedTransactions: () => {
    set((state) => ({
      transactions: state.transactions.filter(
        (tx) => tx.status !== TransactionStatus.Failed
      ),
      pendingCount: state.transactions.filter(
        (tx) => tx.status === TransactionStatus.Pending
      ).length,
    }));
  },
}));

/**
 * Hook for transaction statistics
 */
export function useTransactionStats() {
  const { transactions, pendingCount } = useTransactionStore();

  const stats = {
    total: transactions.length,
    pending: pendingCount,
    success: transactions.filter((tx) => tx.status === TransactionStatus.Success).length,
    failed: transactions.filter((tx) => tx.status === TransactionStatus.Failed).length,
    avgConfirmationTime: (() => {
      const confirmed = transactions.filter(
        (tx) => tx.status === TransactionStatus.Success && tx.confirmedAt && tx.timestamp
      );
      if (confirmed.length === 0) return 0;
      
      const totalTime = confirmed.reduce((acc, tx) => {
        return acc + ((tx.confirmedAt || 0) - tx.timestamp);
      }, 0);
      
      return Math.round(totalTime / confirmed.length);
    })(),
  };

  return stats;
}
