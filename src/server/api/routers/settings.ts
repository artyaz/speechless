import { z } from "zod";
import {
  difficultyLevelSchema,
  normalizeDifficultyLevel,
  normalizeNativeLanguage,
} from "~/lib/user-preferences";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const updatePreferencesInput = z
  .object({
    difficultyLevel: difficultyLevelSchema.optional(),
    nativeLanguage: z.string().max(100).nullable().optional(),
  })
  .refine(
    (value) =>
      value.difficultyLevel !== undefined || value.nativeLanguage !== undefined,
    {
      message: "At least one preference must be provided.",
    },
  );

export const settingsRouter = createTRPCRouter({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("User ID is required");
    }

    const preferences = await ctx.db.userPreference.findUnique({
      where: { userId },
      select: {
        difficultyLevel: true,
        nativeLanguage: true,
      },
    });

    return {
      difficultyLevel: normalizeDifficultyLevel(preferences?.difficultyLevel),
      nativeLanguage: preferences?.nativeLanguage ?? "",
    };
  }),

  updatePreferences: protectedProcedure
    .input(updatePreferencesInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new Error("User ID is required");
      }

      const preferences = await ctx.db.userPreference.upsert({
        where: { userId },
        create: {
          userId,
          difficultyLevel: input.difficultyLevel ?? "intermediate",
          nativeLanguage: normalizeNativeLanguage(input.nativeLanguage),
        },
        update: {
          ...(input.difficultyLevel
            ? { difficultyLevel: input.difficultyLevel }
            : {}),
          ...(input.nativeLanguage !== undefined
            ? { nativeLanguage: normalizeNativeLanguage(input.nativeLanguage) }
            : {}),
        },
        select: {
          difficultyLevel: true,
          nativeLanguage: true,
        },
      });

      return {
        difficultyLevel: normalizeDifficultyLevel(preferences.difficultyLevel),
        nativeLanguage: preferences.nativeLanguage ?? "",
      };
    }),
});
