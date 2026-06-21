// ============================================================================
// Poll Results Component (Live Results with Animated Bars)
// ============================================================================

"use client";

import { Poll, PollStatus } from "@/types";
import { useVote, useHasVoted, useClosePoll } from "@/hooks/use-polls";
import { useWalletStore } from "@/stores/wallet-store";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  truncateAddress,
  formatTimestamp,
  formatRelativeTime,
} from "@/lib/stellar/config";
import {
  CheckCircle2,
  Users,
  Clock,
  User,
  Loader2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PollDetailViewProps {
  poll: Poll;
}

const optionColors = [
  "from-violet-500 to-violet-600",
  "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
  "from-orange-500 to-orange-600",
  "from-fuchsia-500 to-fuchsia-600",
];

export function PollDetailView({ poll }: PollDetailViewProps) {
  const { address, isConnected } = useWalletStore();
  const { data: hasVoted, isLoading: checkingVote } = useHasVoted(poll.id);
  const voteMutation = useVote();
  const closePollMutation = useClosePoll();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const isCreator = address === poll.creator;
  const canVote =
    isConnected &&
    poll.status === PollStatus.Active &&
    !hasVoted &&
    !checkingVote;
  const showResults = hasVoted || poll.status !== PollStatus.Active;

  const handleVote = async () => {
    if (selectedOption === null || !canVote) return;
    try {
      await voteMutation.mutateAsync({
        pollId: poll.id,
        optionIndex: selectedOption,
      });
      setSelectedOption(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleClosePoll = async () => {
    try {
      await closePollMutation.mutateAsync({ pollId: poll.id });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Poll Header */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-sm text-zinc-400">{poll.description}</p>
            )}
          </div>
          <StatusBadge
            status={poll.status}
            pulse={poll.status === PollStatus.Active}
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {truncateAddress(poll.creator, 4)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
          </span>
          {poll.endTime > 0 && (
            <span className="flex items-center gap-1.5" suppressHydrationWarning>
              <Clock className="w-4 h-4" />
              Ends {formatRelativeTime(poll.endTime)}
            </span>
          )}
          <span className="flex items-center gap-1.5" suppressHydrationWarning>
            <Clock className="w-4 h-4" />
            Created {formatTimestamp(poll.createdAt)}
          </span>
        </div>
      </div>

      {/* Voting / Results */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {showResults ? "Results" : "Cast Your Vote"}
        </h2>

        {/* Already voted notice */}
        {hasVoted && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">
              You have already voted on this poll
            </span>
          </div>
        )}

        {/* Not connected notice */}
        {!isConnected && poll.status === PollStatus.Active && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">
              Connect your wallet to vote
            </span>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const percentage =
              poll.totalVotes > 0
                ? (option.voteCount / poll.totalVotes) * 100
                : 0;
            const isSelected = selectedOption === index;
            const colorClass = optionColors[index % optionColors.length];

            return (
              <button
                key={index}
                onClick={() => canVote && setSelectedOption(index)}
                disabled={!canVote}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all duration-300 relative overflow-hidden group",
                  canVote
                    ? "cursor-pointer hover:border-violet-500/40"
                    : "cursor-default",
                  isSelected
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-white/[0.08] bg-white/[0.02]"
                )}
              >
                {/* Background progress bar */}
                {showResults && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-10 transition-all duration-1000",
                      colorClass
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {canVote ? (
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "border-violet-500 bg-violet-500"
                            : "border-zinc-600"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-5 h-5 rounded-lg bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white",
                          colorClass
                        )}
                      >
                        {index + 1}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">
                      {option.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {showResults && (
                      <>
                        <span className="text-xs text-zinc-400">
                          {option.voteCount} vote
                          {option.voteCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-sm font-semibold text-white min-w-[3rem] text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote Button */}
        {canVote && (
          <button
            onClick={handleVote}
            disabled={selectedOption === null || voteMutation.isPending}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium text-sm shadow-lg shadow-violet-500/20 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {voteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Vote...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Vote
              </>
            )}
          </button>
        )}

        {/* Close Poll Button (creator only) */}
        {isCreator && poll.status === PollStatus.Active && (
          <button
            onClick={handleClosePoll}
            disabled={closePollMutation.isPending}
            className="mt-3 w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {closePollMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Closing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Close Poll
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
