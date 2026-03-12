"use client";

import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";
import type { PhonemeAssessment } from "~/types/assessment";

interface PhonemeBreakdownProps {
  phonemes: PhonemeAssessment[];
}

export function PhonemeBreakdown({ phonemes }: PhonemeBreakdownProps) {
  if (phonemes.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[40px_1fr_80px_1fr] items-center gap-x-3 px-2 pb-1 text-xs font-medium text-text-muted">
        <span>IPA</span>
        <span>Score</span>
        <span className="text-right">Value</span>
        <span>Detected as</span>
      </div>

      <div className="space-y-0.5">
        {phonemes.map((p, i) => {
          const level = getScoreLevel(p.accuracyScore);
          const isProblematic = p.accuracyScore < 75;
          const topDetected = p.detectedAs[0];

          return (
            <motion.div
              key={`${p.phoneme}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={cn(
                "grid grid-cols-[40px_1fr_80px_1fr] items-center gap-x-3 rounded-md px-2 py-1.5 transition-colors",
                isProblematic
                  ? "bg-accent-red-dim/50"
                  : "hover:bg-surface",
              )}
            >
              {/* Phoneme symbol */}
              <span
                className={cn(
                  "font-mono text-sm font-semibold",
                  isProblematic ? "text-accent-red" : "text-text-primary",
                )}
              >
                /{p.phoneme}/
              </span>

              {/* Score bar */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: level.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(p.accuracyScore, 2)}%` }}
                    transition={{
                      delay: i * 0.03 + 0.1,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>

              {/* Score value */}
              <span
                className={cn(
                  "text-right font-mono text-xs font-medium",
                  level.textColor,
                )}
              >
                {Math.round(p.accuracyScore)}
              </span>

              {/* Detected as */}
              <span className="truncate text-xs text-text-secondary">
                {topDetected && topDetected.phoneme !== p.phoneme ? (
                  <span>
                    <span className="font-mono text-text-muted">
                      /{topDetected.phoneme}/
                    </span>{" "}
                    <span className="text-text-muted">
                      ({Math.round(topDetected.score)})
                    </span>
                  </span>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
