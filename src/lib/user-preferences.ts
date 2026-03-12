import { z } from "zod";
import type { DifficultyLevel } from "~/types/practice";

export const difficultyLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export function normalizeDifficultyLevel(
  value: string | null | undefined,
): DifficultyLevel {
  const parsed = difficultyLevelSchema.safeParse(value);
  return parsed.success ? parsed.data : "intermediate";
}

export function normalizeNativeLanguage(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : null;
}
