"use client";

import { motion } from "framer-motion";
import { RotateCcw, ArrowRight } from "lucide-react";
import type { AssessmentResult, WordAssessment } from "~/types/assessment";
import { cn } from "~/lib/utils";
import { SCORE_THRESHOLDS } from "~/lib/scoring";
import { ScoreRing } from "./score-ring";
import { WordToken } from "./word-token";

interface ResultsViewProps {
  result: AssessmentResult;
  onWordClick: (word: WordAssessment) => void;
  onRetry: () => void;
  onFinish: () => void;
}

const SCORE_LABELS: { key: keyof AssessmentResult["overallScores"]; label: string }[] = [
  { key: "accuracy", label: "Accuracy" },
  { key: "fluency", label: "Fluency" },
  { key: "completeness", label: "Completeness" },
  { key: "pronunciation", label: "Pronunciation" },
];

export function ResultsView({
  result,
  onWordClick,
  onRetry,
  onFinish,
}: ResultsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Score rings */}
      <motion.div
        className="flex items-center justify-center gap-4 md:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {SCORE_LABELS.map(({ key, label }) => (
          <motion.div
            key={key}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ScoreRing
              score={result.overallScores[key]}
              label={label}
              size={72}
              strokeWidth={5}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Word tokens */}
      <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
        <div className="flex flex-wrap gap-1.5">
          {result.words.map((word, i) => (
            <WordToken
              key={`${word.word}-${i}`}
              assessment={word}
              onClick={() => onWordClick(word)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {SCORE_THRESHOLDS.map((t) => (
          <div key={t.level} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span className="text-xs text-text-muted">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl",
            "border border-border bg-surface px-4 py-3 text-sm font-semibold",
            "text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <button
          type="button"
          onClick={onFinish}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl",
            "bg-accent-blue px-4 py-3 text-sm font-semibold text-white",
            "transition-colors hover:bg-accent-blue/90",
          )}
        >
          Finish
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
