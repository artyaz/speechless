"use client";

import { motion } from "framer-motion";
import type { PracticeType } from "~/types/practice";
import { cn } from "~/lib/utils";

interface TextDisplayProps {
  text: string;
  practiceType: PracticeType;
  isActive?: boolean;
}

export function TextDisplay({ text, practiceType, isActive }: TextDisplayProps) {
  if (practiceType === "word_drill") {
    const words = text.split(/\s+/).filter(Boolean);
    return (
      <Container isActive={isActive}>
        <div className="flex flex-wrap gap-2">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-base font-medium text-text-primary md:text-lg"
            >
              {word}
            </span>
          ))}
        </div>
      </Container>
    );
  }

  if (practiceType === "minimal_pairs") {
    const pairs = text.split(",").map((p) => p.trim()).filter(Boolean);
    return (
      <Container isActive={isActive}>
        <div className="flex flex-wrap gap-3">
          {pairs.map((pair, i) => {
            const [a, b] = pair.split("/").map((s) => s.trim());
            return (
              <div
                key={`${pair}-${i}`}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5"
              >
                <span className="text-base font-medium text-text-primary md:text-lg">
                  {a}
                </span>
                <span className="text-text-muted">/</span>
                <span className="text-base font-medium text-text-primary md:text-lg">
                  {b}
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  return (
    <Container isActive={isActive}>
      <p className="text-lg leading-relaxed text-text-primary md:text-xl">
        {text}
      </p>
    </Container>
  );
}

function Container({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border bg-surface p-5 md:p-6",
        isActive ? "border-accent-red/50" : "border-border",
      )}
      animate={
        isActive
          ? {
              borderColor: [
                "var(--color-accent-red)",
                "var(--color-border)",
                "var(--color-accent-red)",
              ],
            }
          : { borderColor: "var(--color-border)" }
      }
      transition={
        isActive
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {children}
    </motion.div>
  );
}
