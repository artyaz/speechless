export type ScoreLevel = "excellent" | "good" | "needs-work" | "poor";

export interface ScoreThreshold {
  level: ScoreLevel;
  min: number;
  color: string;
  colorDim: string;
  label: string;
  textColor: string;
}

export const SCORE_THRESHOLDS: ScoreThreshold[] = [
  {
    level: "excellent",
    min: 90,
    color: "var(--color-accent-green)",
    colorDim: "var(--color-accent-green-dim)",
    label: "Excellent",
    textColor: "text-accent-green",
  },
  {
    level: "good",
    min: 75,
    color: "var(--color-accent-blue)",
    colorDim: "var(--color-accent-blue-dim)",
    label: "Good",
    textColor: "text-accent-blue",
  },
  {
    level: "needs-work",
    min: 55,
    color: "var(--color-accent-amber)",
    colorDim: "var(--color-accent-amber-dim)",
    label: "Needs Work",
    textColor: "text-accent-amber",
  },
  {
    level: "poor",
    min: 0,
    color: "var(--color-accent-red)",
    colorDim: "var(--color-accent-red-dim)",
    label: "Practice More",
    textColor: "text-accent-red",
  },
];

export function getScoreLevel(score: number): ScoreThreshold {
  return (
    SCORE_THRESHOLDS.find((t) => score >= t.min) ??
    SCORE_THRESHOLDS[SCORE_THRESHOLDS.length - 1]!
  );
}

export function getScoreColor(score: number): string {
  return getScoreLevel(score).color;
}

export function getScoreTextColor(score: number): string {
  return getScoreLevel(score).textColor;
}
