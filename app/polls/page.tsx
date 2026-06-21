// ============================================================================
// Polls Page (Main Application)
// ============================================================================

"use client";

import { useState } from "react";
import { usePolls, usePollCount } from "@/hooks/use-polls";
import { PollList } from "@/components/polls/poll-list";
import { CreatePollDialog } from "@/components/polls/create-poll-dialog";
import { useWalletStore } from "@/stores/wallet-store";
import { BarChart3, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function PollsPage() {
  const { data: polls, isLoading, isError, error, refetch } = usePolls();
  const { data: pollCount } = usePollCount();
  const { isConnected } = useWalletStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreatePoll = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
            <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Polls</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {pollCount !== undefined
                ? `${pollCount} poll${pollCount !== 1 ? "s" : ""} created`
                : "Browse and create on-chain polls"}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreatePoll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-text-primary)] font-medium text-sm transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Create Poll
        </button>
      </div>

      {/* Live update indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs text-[var(--color-text-secondary)]">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Auto-refreshing every 10 seconds</span>
        <span className="relative flex h-1.5 w-1.5 ml-1">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-success)]" />
        </span>
      </div>

      {/* Poll List */}
      <PollList
        polls={polls}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
      />

      {/* Create Poll Dialog */}
      <CreatePollDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
