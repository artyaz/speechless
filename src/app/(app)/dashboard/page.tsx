"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Trophy,
  Flame,
  ArrowRight,
  Play,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";
import { PRACTICE_TYPES } from "~/types/practice";
import { EmptyState } from "~/components/shared/empty-state";
import { LoadingSpinner } from "~/components/shared/loading-spinner";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const statsQuery = api.practice.getStats.useQuery(undefined, {
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });
  const historyQuery = api.practice.getHistory.useQuery(
    { limit: 5 },
    {
      staleTime: 0,
      refetchOnMount: "always",
      retry: 1,
    },
  );

  const { data: stats, isLoading: statsLoading, error: statsError } = statsQuery;
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = historyQuery;

  // Compute derived stats
  const derived = useMemo(() => {
    if (!stats) return null;

    const scores = stats.recentScores ?? [];
    const avg =
      scores.length > 0
        ? scores.reduce((s, r) => s + (r.pronScore ?? 0), 0) / scores.length
        : 0;
    const best =
      scores.length > 0
        ? Math.max(...scores.map((r) => r.pronScore ?? 0))
        : 0;

    // Simple streak: count consecutive days with sessions from most recent
    let streak = 0;
    if (scores.length > 0) {
      const dates = scores.map((s) =>
        new Date(s.createdAt).toISOString().slice(0, 10),
      );
      const uniqueDates = [...new Set(dates)].sort().reverse();
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .slice(0, 10);

      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const prev = new Date(uniqueDates[i - 1]!);
          const curr = new Date(uniqueDates[i]!);
          const diff =
            (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 1) streak++;
          else break;
        }
      }
    }

    return { avg, best, streak };
  }, [stats]);

  // Chart data
  const chartData = useMemo(() => {
    if (!stats?.recentScores) return [];
    return stats.recentScores.map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      pronScore: Math.round(s.pronScore ?? 0),
    }));
  }, [stats]);

  const isLoading = statsLoading || historyLoading;
  const queryError = statsError ?? historyError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon={<AlertCircle />}
          title="Couldn't load your statistics"
          description={queryError.message}
        />
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              void Promise.all([statsQuery.refetch(), historyQuery.refetch()]);
            }}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-elevated"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Sessions",
      value: stats?.totalSessions ?? 0,
      icon: Target,
      color: "text-accent-blue",
    },
    {
      label: "Avg Score",
      value: Math.round(derived?.avg ?? 0),
      icon: TrendingUp,
      color: "text-accent-green",
    },
    {
      label: "Best Score",
      value: Math.round(derived?.best ?? 0),
      icon: Trophy,
      color: "text-accent-amber",
    },
    {
      label: "Streak",
      value: `${derived?.streak ?? 0}d`,
      icon: Flame,
      color: "text-accent-red",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
      </div>

      <motion.div
        className="flex flex-col gap-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Stat cards */}
        <motion.div
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          variants={stagger}
        >
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              variants={fadeUp}
              className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <card.icon className={cn("h-4 w-4", card.color)} />
                <span className="text-xs font-medium text-text-muted">
                  {card.label}
                </span>
              </div>
              <span className="font-mono text-2xl font-bold text-text-primary">
                {card.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Score Over Time */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-4 md:p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-text-primary">
            Score Over Time
          </h2>
          {chartData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#262626"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #262626",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                    itemStyle={{ color: "#22c55e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pronScore"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e", r: 3 }}
                    activeDot={{ r: 5, fill: "#22c55e" }}
                    name="Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp />}
              title="Not enough data"
              description="Complete a few sessions to see your score trend."
            />
          )}
        </motion.div>

        {/* Weak Phonemes */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-4 md:p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-text-primary">
            Weak Phonemes
          </h2>
          {stats?.weakPhonemes && stats.weakPhonemes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {stats.weakPhonemes
                .sort((a, b) => a.avgScore - b.avgScore)
                .slice(0, 8)
                .map((ph) => {
                  const level = getScoreLevel(ph.avgScore);
                  return (
                    <div
                      key={ph.phoneme}
                      className="flex items-center gap-3 rounded-lg border border-border bg-elevated px-3 py-2"
                    >
                      <span className="w-10 font-mono text-sm font-bold text-text-primary">
                        {ph.phoneme}
                      </span>
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${ph.avgScore}%`,
                              backgroundColor: level.color,
                            }}
                          />
                        </div>
                        <span
                          className="w-8 text-right font-mono text-xs font-semibold"
                          style={{ color: level.color }}
                        >
                          {Math.round(ph.avgScore)}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {ph.attemptCount}×
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <EmptyState
              icon={<Target />}
              title="No weak phonemes yet"
              description="Complete sessions to identify areas to improve."
            />
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-4 md:p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Sessions
            </h2>
            <Link
              href="/history"
              className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-text-secondary"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {history?.sessions && history.sessions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {history.sessions.map((session) => {
                const typeLabel =
                  PRACTICE_TYPES.find((t) => t.type === session.type)
                    ?.label ?? session.type;
                const level = getScoreLevel(session.pronScore ?? 0);
                const date = new Date(session.createdAt);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-elevated px-3 py-2.5"
                  >
                    <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {typeLabel}
                    </span>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: level.color }}
                    >
                      {Math.round(session.pronScore ?? 0)}
                    </span>
                    <span className="ml-auto text-xs text-text-muted">
                      {formatRelativeDate(date)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Target />}
              title="No sessions yet"
              description="Start practicing to track your progress."
            />
          )}
        </motion.div>

        {/* Quick action */}
        <motion.div variants={fadeUp}>
          <Link
            href="/practice"
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl",
              "bg-accent-green px-4 py-3 text-sm font-semibold text-white",
              "transition-colors hover:bg-accent-green/90",
            )}
          >
            <Play className="h-4 w-4" />
            Start Practice
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
