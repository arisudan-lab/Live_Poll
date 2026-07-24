// ============================================================================
// Transaction Management Tests
// ============================================================================

import { useTransactionStore } from '../stores/transaction-store';
import { TransactionStatus, TransactionType } from '../types';

describe('Transaction Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useTransactionStore.getState().clearTransactions();
  });

  test('adds a new transaction with pending status', () => {
    const { addTransaction } = useTransactionStore.getState();
    
    addTransaction(
      'test-tx-hash-123',
      TransactionType.CreatePoll,
      'Created test poll'
    );

    const state = useTransactionStore.getState();
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].hash).toBe('test-tx-hash-123');
    expect(state.transactions[0].status).toBe(TransactionStatus.Pending);
    expect(state.transactions[0].type).toBe(TransactionType.CreatePoll);
    expect(state.pendingCount).toBe(1);
  });

  test('updates transaction status', () => {
    const { addTransaction, updateTransaction } = useTransactionStore.getState();
    
    addTransaction('tx-hash-1', TransactionType.CastVote, 'Voted on poll');
    
    updateTransaction('tx-hash-1', {
      status: TransactionStatus.Success,
      confirmedAt: Date.now(),
    });

    const state = useTransactionStore.getState();
    expect(state.transactions[0].status).toBe(TransactionStatus.Success);
    expect(state.pendingCount).toBe(0);
  });

  test('marks transaction as failed with error message', () => {
    const { addTransaction, markAsFailed } = useTransactionStore.getState();
    
    addTransaction('tx-hash-failed', TransactionType.ClosePoll, 'Close poll');
    
    markAsFailed('tx-hash-failed', 'Insufficient balance');

    const state = useTransactionStore.getState();
    expect(state.transactions[0].status).toBe(TransactionStatus.Failed);
    expect(state.transactions[0].errorMessage).toBe('Insufficient balance');
    expect(state.pendingCount).toBe(0);
  });

  test('tracks pending count correctly', () => {
    const { addTransaction, markAsConfirmed, markAsFailed } = useTransactionStore.getState();
    
    addTransaction('tx-1', TransactionType.CreatePoll, 'Poll 1');
    addTransaction('tx-2', TransactionType.CastVote, 'Vote 1');
    addTransaction('tx-3', TransactionType.ClosePoll, 'Close 1');

    let state = useTransactionStore.getState();
    expect(state.pendingCount).toBe(3);

    markAsConfirmed('tx-1');
    state = useTransactionStore.getState();
    expect(state.pendingCount).toBe(2);

    markAsFailed('tx-2', 'Error');
    state = useTransactionStore.getState();
    expect(state.pendingCount).toBe(1);
  });

  test('returns transactions by status', () => {
    const { addTransaction, markAsConfirmed } = useTransactionStore.getState();
    
    addTransaction('tx-1', TransactionType.CreatePoll, 'Poll 1');
    addTransaction('tx-2', TransactionType.CastVote, 'Vote 1');
    
    markAsConfirmed('tx-1');

    const state = useTransactionStore.getState();
    const pending = state.getTransactionsByStatus(TransactionStatus.Pending);
    const success = state.getTransactionsByStatus(TransactionStatus.Success);

    expect(pending).toHaveLength(1);
    expect(success).toHaveLength(1);
    expect(pending[0].hash).toBe('tx-2');
    expect(success[0].hash).toBe('tx-1');
  });

  test('gets recent transactions with limit', () => {
    const { addTransaction, getRecentTransactions } = useTransactionStore.getState();
    
    for (let i = 1; i <= 25; i++) {
      addTransaction(`tx-${i}`, TransactionType.CreatePoll, `Poll ${i}`);
    }

    const state = useTransactionStore.getState();
    const recent = state.getRecentTransactions(10);

    expect(recent).toHaveLength(10);
    expect(recent[0].hash).toBe('tx-25'); // Most recent first
    expect(recent[9].hash).toBe('tx-16');
  });

  test('clears all transactions', () => {
    const { addTransaction, clearTransactions } = useTransactionStore.getState();
    
    addTransaction('tx-1', TransactionType.CreatePoll, 'Poll 1');
    addTransaction('tx-2', TransactionType.CastVote, 'Vote 1');

    clearTransactions();

    const state = useTransactionStore.getState();
    expect(state.transactions).toHaveLength(0);
    expect(state.pendingCount).toBe(0);
  });

  test('clears only failed transactions', () => {
    const { addTransaction, markAsFailed, clearFailedTransactions } = useTransactionStore.getState();
    
    addTransaction('tx-1', TransactionType.CreatePoll, 'Poll 1');
    addTransaction('tx-2', TransactionType.CastVote, 'Vote 1');
    
    markAsFailed('tx-2', 'Error');

    clearFailedTransactions();

    const state = useTransactionStore.getState();
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].hash).toBe('tx-1');
  });

  test('includes retry count in transaction', () => {
    const { addTransaction, updateTransaction } = useTransactionStore.getState();
    
    addTransaction('tx-retry', TransactionType.CreatePoll, 'Poll with retry');
    
    updateTransaction('tx-retry', {
      retryCount: 2,
      lastRetryAt: Date.now(),
    });

    const state = useTransactionStore.getState();
    expect(state.transactions[0].retryCount).toBe(2);
    expect(state.transactions[0].lastRetryAt).toBeDefined();
  });

  test('includes ledger number on confirmation', () => {
    const { addTransaction, markAsConfirmed } = useTransactionStore.getState();
    
    addTransaction('tx-ledger', TransactionType.CreatePoll, 'Poll');
    
    markAsConfirmed('tx-ledger', 12345);

    const state = useTransactionStore.getState();
    expect(state.transactions[0].ledger).toBe(12345);
    expect(state.transactions[0].confirmedAt).toBeDefined();
  });
});
