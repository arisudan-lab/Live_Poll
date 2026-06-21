// ============================================================================
// Wallet State Store (Zustand)
// ============================================================================

import { create } from "zustand";
import { WalletState } from "@/types";
import {
  connectWallet as walletConnect,
  disconnectWallet as walletDisconnect,
} from "@/lib/wallet/stellar-wallets";
import { fetchXLMBalance } from "@/lib/stellar/transaction";
import { NETWORK_CONFIG } from "@/lib/stellar/config";

interface WalletStore extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  setError: (error: string | null) => void;
  error: string | null;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  network: NETWORK_CONFIG.network,
  balance: null,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const address = await walletConnect();
      set({ address, isConnected: true, isConnecting: false });
      // Fetch balance after connecting
      get().refreshBalance();
    } catch (error: unknown) {
      const err = error as { message?: string };
      set({
        isConnecting: false,
        error: err?.message || "Failed to connect wallet",
      });
      throw error;
    }
  },

  disconnect: () => {
    walletDisconnect();
    set({
      address: null,
      isConnected: false,
      balance: null,
      error: null,
    });
  },

  refreshBalance: async () => {
    const { address } = get();
    if (!address) return;
    try {
      const balance = await fetchXLMBalance(address);
      set({ balance });
    } catch {
      console.error("Failed to fetch balance");
    }
  },

  setError: (error) => set({ error }),
}));
