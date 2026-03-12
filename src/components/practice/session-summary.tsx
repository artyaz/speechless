"use client";

import { motion } from "framer-motion";
import { RotateCcw, LayoutDashboard, AlertTriangle } from "lucide-react";
import type { AssessmentResult } from "~/types/assessment";
import type { PracticeType } from "~/types/practice";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";
import { ScoreRing } from "./score-ring";

interface SessionSummaryProps {
  result: AssessmentResult;
  practiceType: PracticeType;
  onPracticeAgain: () => void;
  onGoToDashboard: () => void;
}

function getEncouragement(score: number): string {
  if (score >= 90) return "Outstanding! Your pronunciation is excellent.";
  if (score >= 75) return "Great job! You're making solid progress.";
  if (score >= 55) return "Good effort! Keep practicing to improve.";
  return "Don't give up! Consistent practice makes a difference.";
}

export function SessionSummary({
  result,
  practiceType: _practiceType,
  onPracticeAgain,
  onGoToDashboard,
}: SessionSummaryProps) {
  const { pronunciation, accuracy, fluency, completeness } = result.overallScores;
  const pronLevel = getScoreLevel(pronunciation);

  // Find worst-scored words (non-insertion, score < 80), up to 5
  const topMistakes = [...result.words]
    .filter((w) => w.errorType !== "insertion" && w.accuracyScore < 80)
    .sort((a, b) => a.accuracyScore - b.accuracyScore)
    .slice(0, 5);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <p className="text-sm font-medium text-text-muted">
          {getEncouragement(pronunciation)}
        </p>
      </motion.div>

      {/* Big pronunciation score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <ScoreRing
          score={pronunciation}
          size={120}
          strokeWidth={8}
          label="Pronunciation"
        />
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={cn("text-sm font-semibold", pronLevel.textColor)}
      >
        {pronLevel.label}
      </motion.span>

      {/* Key stats */}
      <motion.div
        className="grid w-full grid-cols-3 gap-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {[
          { label: "Accuracy", value: accuracy },
          { label: "Fluency", value: fluency },
          { label: "Completeness", value: completeness },
        ].map(({ label, value }) => {
          const level = getScoreLevel(value);
          return (
            <motion.div
              key={label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-3"
            >
              <span
                className="font-mono text-xl font-bold"
                style={{ color: level.color }}
              >
                {Math.round(value)}
              </span>
              <span className="text-xs text-text-muted">{label}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Top mistakes */}
      {topMistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-xl border border-border bg-surface p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent-amber" />
            <h3 className="text-sm font-semibold text-text-primary">
              Top Mistakes
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {topMistakes.map((word, i) => {
              const level = getScoreLevel(word.accuracyScore);
              return (
                <div
                  key={`${word.word}-${i}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-text-secondary">
                    {word.word}
                  </span>
                  <span
                    className="font-mono text-sm font-semibold"
                    style={{ color: level.color }}
                  >
                    {Math.round(word.accuracyScore)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CTAs */}
      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          onClick={onPracticeAgain}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl",
            "border border-border bg-surface px-4 py-3 text-sm font-semibold",
            "text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </button>
        <button
          type="button"
          onClick={onGoToDashboard}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl",
            "bg-accent-blue px-4 py-3 text-sm font-semibold text-white",
            "transition-colors hover:bg-accent-blue/90",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
      </div>
    </div>
  );
}
