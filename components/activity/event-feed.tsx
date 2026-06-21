// ============================================================================
// Event Feed Component
// ============================================================================

"use client";

import { ContractEvent, ContractEventType } from "@/types";
import { truncateAddress, formatRelativeTime } from "@/lib/stellar/config";
import { Vote, CheckCircle2, Lock, Activity, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventFeedProps {
  events: ContractEvent[];
  isPolling: boolean;
}

const eventConfig: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  [ContractEventType.PollCreated]: {
    icon: Vote,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  [ContractEventType.VoteCast]: {
    icon: CheckCircle2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  [ContractEventType.PollClosed]: {
    icon: Lock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
};

export function EventFeed({ events, isPolling }: EventFeedProps) {
  return (
    <div className="space-y-3">
      {/* Polling indicator */}
      {isPolling && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-emerald-400">
            Live — Auto-updating
          </span>
        </div>
      )}

      {events.map((event, index) => (
        <EventItem key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}

function EventItem({ event, index }: { event: ContractEvent; index: number }) {
  const config = eventConfig[event.type] || {
    icon: Activity,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
  };
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-300",
        index === 0 && "animate-in slide-in-from-top-2 duration-500"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0",
          config.bg
        )}
      >
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-zinc-300 capitalize">
            {event.type ? event.type.replace("_", " ") : "Unknown"}
          </span>
          <span className="text-xs text-zinc-600">•</span>
          <span className="text-xs text-zinc-500" suppressHydrationWarning>
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>
        <p className="text-sm text-white">{event.action}</p>
        <p className="text-xs text-zinc-500 mt-1 font-mono">
          {truncateAddress(event.walletAddress, 6)}
        </p>
      </div>

      {/* Ledger */}
      <span className="text-xs text-zinc-600 font-mono flex-shrink-0">
        #{event.ledger}
      </span>
    </div>
  );
}
