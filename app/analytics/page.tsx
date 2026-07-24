// ============================================================================
// Analytics Dashboard Page
// ============================================================================

"use client";

import { usePolls, usePollCount } from "@/hooks/use-polls";
import { useEventStats } from "@/hooks/use-events";
import { useTransactionStats } from "@/stores/transaction-store";
import { BarChart3, TrendingUp, Users, Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function AnalyticsPage() {
  const { data: polls } = usePolls();
  const { data: pollCount } = usePollCount();
  const eventStats = useEventStats();
  const transactionStats = useTransactionStats();

  // Calculate analytics
  const totalVotes = polls?.reduce((acc, poll) => acc + poll.totalVotes, 0) || 0;
  const activePolls = polls?.filter((p) => p.status === "active").length || 0;
  const closedPolls = polls?.filter((p) => p.status === "closed" || p.status === "ended").length || 0;
  const avgVotesPerPoll = pollCount && pollCount > 0 ? Math.round(totalVotes / pollCount) : 0;

  const statsCards = [
    {
      title: "Total Polls",
      value: pollCount ?? "—",
      icon: BarChart3,
      color: "text-[var(--color-primary)]",
      bgColor: "bg-[var(--color-primary)]/10",
    },
    {
      title: "Total Votes",
      value: totalVotes.toLocaleString(),
      icon: TrendingUp,
      color: "text-[var(--color-success)]",
      bgColor: "bg-[var(--color-success)]/10",
    },
    {
      title: "Active Polls",
      value: activePolls,
      icon: Activity,
      color: "text-[var(--color-accent-orange)]",
      bgColor: "bg-[var(--color-accent-orange)]/10",
    },
    {
      title: "Avg Votes/Poll",
      value: avgVotesPerPoll,
      icon: Users,
      color: "text-[var(--color-info)]",
      bgColor: "bg-[var(--color-info)]/10",
    },
  ];

  const transactionCards = [
    {
      title: "Successful",
      value: transactionStats.success,
      icon: CheckCircle,
      color: "text-[var(--color-success)]",
      bgColor: "bg-[var(--color-success)]/10",
    },
    {
      title: "Pending",
      value: transactionStats.pending,
      icon: Clock,
      color: "text-[var(--color-warning)]",
      bgColor: "bg-[var(--color-warning)]/10",
    },
    {
      title: "Failed",
      value: transactionStats.failed,
      icon: AlertCircle,
      color: "text-[var(--color-error)]",
      bgColor: "bg-[var(--color-error)]/10",
    },
    {
      title: "Avg Confirm (s)",
      value: transactionStats.avgConfirmationTime || "—",
      icon: Activity,
      color: "text-[var(--color-primary)]",
      bgColor: "bg-[var(--color-primary)]/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
          <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Platform metrics and activity insights
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Transaction Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Transaction Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {transactionCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Statistics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Event Statistics
        </h2>
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {eventStats.pollCreated}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Polls Created</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {eventStats.voteCast}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Votes Cast</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-orange)]/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-[var(--color-accent-orange)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {eventStats.pollClosed}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">Polls Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Poll Status Breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Poll Status Breakdown
        </h2>
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6">
          <div className="space-y-4">
            {/* Active Polls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Active</span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {activePolls} / {pollCount ?? 0}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-success)] transition-all duration-500"
                  style={{
                    width: `${pollCount && pollCount > 0 ? (activePolls / pollCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Closed Polls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Closed</span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {closedPolls} / {pollCount ?? 0}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent-orange)] transition-all duration-500"
                  style={{
                    width: `${pollCount && pollCount > 0 ? (closedPolls / pollCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
