// ============================================================================
// Poll React Query Hooks
// ============================================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPolls,
  getPoll,
  getPollCount,
  getVoter,
  buildCreatePollTx,
  buildVoteTx,
  buildClosePollTx,
  submitTransaction,
} from "@/lib/stellar/contract";
import { signTransaction } from "@/lib/wallet/stellar-wallets";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { TransactionType } from "@/types";
import { toast } from "sonner";
import { getWalletErrorMessage } from "@/lib/wallet/stellar-wallets";

// ─── Read Hooks ────────────────────────────────────────────────────────────

export function usePolls(start = 0, limit = 20) {
  return useQuery({
    queryKey: ["polls", start, limit],
    queryFn: () => getPolls(start, limit),
    refetchInterval: 10000, // Auto-refresh every 10s
    staleTime: 5000,
    retry: 2,
  });
}

export function usePoll(id: number) {
  return useQuery({
    queryKey: ["poll", id],
    queryFn: () => getPoll(id),
    enabled: id >= 0,
    refetchInterval: 5000, // Refresh poll every 5s for live results
    staleTime: 3000,
    retry: 2,
  });
}

export function usePollCount() {
  return useQuery({
    queryKey: ["pollCount"],
    queryFn: getPollCount,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function useHasVoted(pollId: number) {
  const { address } = useWalletStore();

  return useQuery({
    queryKey: ["hasVoted", pollId, address],
    queryFn: () => getVoter(pollId, address!),
    enabled: !!address && pollId >= 0,
    staleTime: 5000,
  });
}

// ─── Write Hooks (Mutations) ──────────────────────────────────────────────

export function useCreatePoll() {
  const queryClient = useQueryClient();
  const { address } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      options,
      endTime,
    }: {
      title: string;
      description: string;
      options: string[];
      endTime: number;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      toast.loading("Building transaction...", { id: "create-poll" });

      // Build the transaction
      const txXdr = await buildCreatePollTx(
        address,
        title,
        description,
        options,
        endTime
      );

      toast.loading("Please sign in your wallet...", { id: "create-poll" });

      // Sign via wallet
      const signedXdr = await signTransaction(txXdr);

      toast.loading("Submitting transaction...", { id: "create-poll" });

      // Submit
      const hash = await submitTransaction(signedXdr);

      // Track the transaction
      addTransaction(hash, TransactionType.CreatePoll, `Created poll: ${title}`);

      toast.success("Poll created successfully!", { id: "create-poll" });
      return hash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["pollCount"] });
    },
    onError: (error) => {
      const message = getWalletErrorMessage(error);
      toast.error(message, { id: "create-poll" });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  const { address } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  return useMutation({
    mutationFn: async ({
      pollId,
      optionIndex,
    }: {
      pollId: number;
      optionIndex: number;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      toast.loading("Building transaction...", { id: "vote" });

      const txXdr = await buildVoteTx(address, pollId, optionIndex);

      toast.loading("Please sign in your wallet...", { id: "vote" });

      const signedXdr = await signTransaction(txXdr);

      toast.loading("Submitting vote...", { id: "vote" });

      const hash = await submitTransaction(signedXdr);

      addTransaction(
        hash,
        TransactionType.CastVote,
        `Voted on poll #${pollId}`
      );

      toast.success("Vote submitted!", { id: "vote" });
      return hash;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({
        queryKey: ["hasVoted", variables.pollId],
      });
    },
    onError: (error) => {
      const message = getWalletErrorMessage(error);
      toast.error(message, { id: "vote" });
    },
  });
}

export function useClosePoll() {
  const queryClient = useQueryClient();
  const { address } = useWalletStore();
  const { addTransaction } = useTransactionStore();

  return useMutation({
    mutationFn: async ({ pollId }: { pollId: number }) => {
      if (!address) throw new Error("Wallet not connected");

      toast.loading("Building transaction...", { id: "close-poll" });

      const txXdr = await buildClosePollTx(address, pollId);

      toast.loading("Please sign in your wallet...", { id: "close-poll" });

      const signedXdr = await signTransaction(txXdr);

      toast.loading("Closing poll...", { id: "close-poll" });

      const hash = await submitTransaction(signedXdr);

      addTransaction(hash, TransactionType.ClosePoll, `Closed poll #${pollId}`);

      toast.success("Poll closed!", { id: "close-poll" });
      return hash;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
    onError: (error) => {
      const message = getWalletErrorMessage(error);
      toast.error(message, { id: "close-poll" });
    },
  });
}
