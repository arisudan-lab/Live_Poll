// ============================================================================
// Poll Card Component
// ============================================================================

"use client";

import Link from "next/link";
import { Poll, PollStatus } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { truncateAddress, formatRelativeTime } from "@/lib/stellar/config";
import { Users, Clock, ArrowRight } from "lucide-react";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const maxVotes = Math.max(...poll.options.map((o) => o.voteCount), 1);

  return (
    <Link href={`/polls/${poll.id}`} className="group block">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-6 transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 relative overflow-hidden">
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white group-hover:text-violet-200 transition-colors truncate">
                {poll.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 truncate">
                by {truncateAddress(poll.creator, 4)}
              </p>
            </div>
            <StatusBadge
              status={poll.status}
              pulse={poll.status === PollStatus.Active}
            />
          </div>

          {/* Description */}
          {poll.description && (
            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
              {poll.description}
            </p>
          )}

          {/* Mini bars */}
          <div className="space-y-2 mb-4">
            {poll.options.slice(0, 3).map((option, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 truncate flex-1">
                    {option.label}
                  </span>
                  <span className="text-zinc-500 ml-2">
                    {poll.totalVotes > 0
                      ? Math.round((option.voteCount / poll.totalVotes) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                    style={{
                      width: `${
                        poll.totalVotes > 0
                          ? (option.voteCount / poll.totalVotes) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {poll.options.length > 3 && (
              <p className="text-xs text-zinc-500">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
              </span>
              {poll.endTime > 0 && (
                <span className="flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(poll.endTime)}
                </span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
