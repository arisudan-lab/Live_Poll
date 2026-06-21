// ============================================================================
// Wallet Connect Button
// ============================================================================

"use client";

import { useWallet } from "@/hooks/use-wallet";
import { truncateAddress } from "@/lib/stellar/config";
import { getWalletErrorMessage } from "@/lib/wallet/stellar-wallets";
import { Wallet, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export function ConnectButton() {
  const { address, isConnected, isConnecting, balance, connect, disconnect } =
    useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      const message = getWalletErrorMessage(error);
      toast.error(message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setMenuOpen(false);
    toast.info("Wallet disconnected");
  };

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)] cursor-wait"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] hover:brightness-110 border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] transition-all duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]" />
          <span className="hidden sm:inline font-mono text-xs">
            {truncateAddress(address, 4)}
          </span>
          {balance && (
            <span className="hidden lg:inline text-[var(--color-text-secondary)] text-xs">
              {balance} XLM
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)]" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-sm overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
              <p className="text-xs text-[var(--color-text-secondary)]">Connected Wallet</p>
              <p className="text-sm font-mono text-[var(--color-text-primary)] mt-0.5">
                {truncateAddress(address, 6)}
              </p>
              {balance && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{balance} XLM</p>
              )}
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[var(--color-accent-pink)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:brightness-110 text-sm font-medium text-white shadow-sm transition-all duration-200"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
