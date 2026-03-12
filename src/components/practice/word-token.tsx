"use client";

import { motion } from "framer-motion";
import type { WordAssessment } from "~/types/assessment";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";

interface WordTokenProps {
  assessment: WordAssessment;
  onClick: () => void;
  index: number;
}

export function WordToken({ assessment, onClick, index }: WordTokenProps) {
  const { word, accuracyScore, errorType } = assessment;
  const { color, colorDim } = getScoreLevel(accuracyScore);

  const isOmission = errorType === "omission";
  const isInsertion = errorType === "insertion";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.03,
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-sm font-medium",
        "transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent-blue focus-visible:ring-offset-1",
        "focus-visible:ring-offset-background",
        isOmission && "line-through",
        isInsertion && "border-dashed",
      )}
      style={{
        borderWidth: "1px",
        borderStyle: isInsertion ? "dashed" : "solid",
        borderColor: color,
        backgroundColor: colorDim,
        color: "var(--color-text-primary)",
      }}
    >
      {word}
    </motion.button>
  );
}
