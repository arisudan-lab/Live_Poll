// ============================================================================
// Poll Card Component
// ============================================================================

"use client";

import Link from "next/link";
import { Poll } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { truncateAddress, formatRelativeTime } from "@/lib/stellar/config";
import { Users, Clock, ArrowRight } from "lucide-react";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {


  return (
    <Link href={`/polls/${poll.id}`} className="group block">
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-sm relative overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                {poll.title}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 truncate">
                by {truncateAddress(poll.creator, 4)}
              </p>
            </div>
            <StatusBadge
              status={poll.status}
              pulse={false}
            />
          </div>

          {/* Description */}
          {poll.description && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
              {poll.description}
            </p>
          )}

          {/* Mini bars */}
          <div className="space-y-2 mb-4">
            {poll.options.slice(0, 3).map((option, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)] truncate flex-1">
                    {option.label}
                  </span>
                  <span className="text-[var(--color-text-secondary)] ml-2">
                    {poll.totalVotes > 0
                      ? Math.round((option.voteCount / poll.totalVotes) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-700"
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
              <p className="text-xs text-[var(--color-text-secondary)]">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
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
            <ArrowRight className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
