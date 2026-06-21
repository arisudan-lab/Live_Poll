// ============================================================================
// App Providers (React Query + Wallet Init)
// ============================================================================

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { initWalletKit } from "@/lib/wallet/stellar-wallets";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
            staleTime: 5000,
          },
        },
      })
  );

  // Initialize wallet kit on client mount
  useEffect(() => {
    initWalletKit().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "white",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
