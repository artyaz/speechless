"use client";

import { motion } from "framer-motion";
import {
  Zap,
  AlignLeft,
  FileText,
  Target,
  ArrowLeftRight,
  Flame,
  type LucideIcon,
} from "lucide-react";
import type { PracticeTypeConfig } from "~/types/practice";
import { cn } from "~/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Zap,
  AlignLeft,
  FileText,
  Target,
  ArrowLeftRight,
  Flame,
};

interface PracticeTypeCardProps extends PracticeTypeConfig {
  onClick: () => void;
}

export function PracticeTypeCard({
  type,
  label,
  description,
  estimatedTime,
  icon,
  onClick,
}: PracticeTypeCardProps) {
  const Icon = ICONS[icon] ?? Zap;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex w-full flex-col items-start gap-3 rounded-xl border border-border",
        "bg-surface p-5 text-left transition-colors",
        "hover:bg-elevated focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent-blue focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background cursor-pointer",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated">
          <Icon className="h-5 w-5 text-text-secondary" />
        </div>
        <span className="rounded-md bg-elevated px-2.5 py-1 text-xs font-medium text-text-muted">
          {estimatedTime}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-text-primary">{label}</h3>
        <p className="text-sm leading-relaxed text-text-muted">{description}</p>
      </div>
    </motion.button>
  );
}
