// ============================================================================
// Wallet Hook
// ============================================================================

"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { initWalletKit } from "@/lib/wallet/stellar-wallets";

/**
 * Hook to initialize the wallet kit on mount and provide wallet state.
 */
export function useWallet() {
  const store = useWalletStore();

  useEffect(() => {
    // Initialize the wallet kit when the component mounts
    initWalletKit().catch(console.error);
  }, []);

  // Periodically refresh balance when connected
  useEffect(() => {
    if (!store.isConnected || !store.address) return;

    const interval = setInterval(() => {
      store.refreshBalance();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [store.isConnected, store.address]);

  return store;
}
