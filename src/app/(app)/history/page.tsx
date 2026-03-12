"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";
import { PRACTICE_TYPES } from "~/types/practice";
import { EmptyState } from "~/components/shared/empty-state";
import { LoadingSpinner } from "~/components/shared/loading-spinner";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export default function HistoryPage() {
  const { data, isLoading } = api.practice.getHistory.useQuery({ limit: 20 });
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          History
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your past practice sessions
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.sessions || data.sessions.length === 0 ? (
        <EmptyState
          icon={<Clock />}
          title="No sessions yet"
          description="Complete your first practice session to start building your history."
        />
      ) : (
        <motion.div
          className="flex flex-col gap-2"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {data.sessions.map((session) => {
            const isExpanded = expanded === session.id;
            const typeConfig = PRACTICE_TYPES.find(
              (t) => t.type === session.type,
            );
            const pronScore = session.pronScore ?? 0;
            const accScore = session.accuracyScore ?? 0;
            const pronLevel = getScoreLevel(pronScore);
            const date = new Date(session.createdAt);
            const preview =
              (session.referenceText ?? "").length > 60
                ? session.referenceText.slice(0, 60) + "…"
                : (session.referenceText ?? "");

            return (
              <motion.div
                key={session.id}
                variants={fadeUp}
                layout
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isExpanded ? null : session.id)
                  }
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-elevated"
                >
                  {/* Type badge */}
                  <span className="shrink-0 rounded-md bg-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {typeConfig?.label ?? session.type}
                  </span>

                  {/* Preview text */}
                  <span className="min-w-0 flex-1 truncate text-sm text-text-muted">
                    {preview}
                  </span>

                  {/* Scores */}
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: pronLevel.color }}
                    >
                      {Math.round(pronScore)}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="hidden shrink-0 text-xs text-text-muted sm:block">
                    {formatRelativeDate(date)}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-text-muted transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 py-4">
                        {/* Full text */}
                        {session.referenceText && (
                          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                            {session.referenceText}
                          </p>
                        )}

                        {/* Scores grid */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            {
                              label: "Pronunciation",
                              value: pronScore,
                            },
                            {
                              label: "Accuracy",
                              value: accScore,
                            },
                            {
                              label: "Fluency",
                              value: session.fluencyScore ?? 0,
                            },
                            {
                              label: "Completeness",
                              value: session.completenessScore ?? 0,
                            },
                          ].map((stat) => {
                            const level = getScoreLevel(stat.value);
                            return (
                              <div
                                key={stat.label}
                                className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-elevated p-2"
                              >
                                <span
                                  className="font-mono text-lg font-bold"
                                  style={{ color: level.color }}
                                >
                                  {Math.round(stat.value)}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                  {stat.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Date on mobile */}
                        <p className="mt-3 text-xs text-text-muted sm:hidden">
                          {formatRelativeDate(date)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
