// PRIVACY: Only text-based assessment scores are stored. No audio recordings are saved.
import { z } from "zod";
import { difficultyLevelSchema, normalizeDifficultyLevel } from "~/lib/user-preferences";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generatePracticeText } from "~/lib/gemini";
import { sanitizeAssessmentResult } from "~/lib/privacy";
import type { PracticeType } from "~/types/practice";
import type { db as dbInstance } from "~/server/db";
import { type Prisma } from "../../../../generated/prisma";

export const practiceRouter = createTRPCRouter({
  generateText: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "sentence",
          "short",
          "long",
          "word_drill",
          "minimal_pairs",
          "tongue_twister",
        ]),
        difficulty: difficultyLevelSchema.optional(),
        targetPhonemes: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preferences = await ctx.db.userPreference.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          difficultyLevel: true,
          nativeLanguage: true,
        },
      });
      const difficulty = input.difficulty
        ?? normalizeDifficultyLevel(preferences?.difficultyLevel);

      const text = await generatePracticeText(
        input.type as PracticeType,
        difficulty,
        input.targetPhonemes,
        preferences?.nativeLanguage,
      );
      return { text };
    }),

  saveSession: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "sentence",
          "short",
          "long",
          "word_drill",
          "minimal_pairs",
          "tongue_twister",
        ]),
        referenceText: z.string(),
        recognizedText: z.string().optional(),
        accuracyScore: z.number().optional(),
        fluencyScore: z.number().optional(),
        completenessScore: z.number().optional(),
        pronScore: z.number().optional(),
        detailedResult: z.unknown().optional(),
        durationMs: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.id) {
        throw new Error("User ID is required");
      }
      const userId = ctx.session.user.id;

      // Strip any binary/audio data that may have been included by mistake
      const sanitizedResult = input.detailedResult
        ? sanitizeAssessmentResult(input.detailedResult)
        : undefined;

      const session = await ctx.db.practiceSession.create({
        data: {
          user: { connect: { id: userId } },
          type: input.type,
          referenceText: input.referenceText,
          recognizedText: input.recognizedText,
          accuracyScore: input.accuracyScore,
          fluencyScore: input.fluencyScore,
          completenessScore: input.completenessScore,
          pronScore: input.pronScore,
          detailedResult:
            (sanitizedResult as Prisma.InputJsonValue) ?? undefined,
          durationMs: input.durationMs,
        },
      });

      if (sanitizedResult) {
        await updatePhonemeWeaknesses(
          ctx.db,
          userId,
          sanitizedResult,
        );
      }

      return session;
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sessions = await ctx.db.practiceSession.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (sessions.length > input.limit) {
        const nextItem = sessions.pop();
        nextCursor = nextItem?.id;
      }

      return { sessions, nextCursor };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
      const [totalSessions, recentScores, weakPhonemes] = await Promise.all([
        ctx.db.practiceSession.count({
          where: { userId: ctx.session.user.id },
        }),
      ctx.db.practiceSession.findMany({
        where: { userId: ctx.session.user.id, pronScore: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          pronScore: true,
          accuracyScore: true,
          fluencyScore: true,
          createdAt: true,
          type: true,
        },
      }),
      ctx.db.phonemeWeakness.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { avgScore: "asc" },
        take: 10,
      }),
    ]);

    return { totalSessions, recentScores, weakPhonemes };
  }),
});

async function updatePhonemeWeaknesses(
  db: typeof dbInstance,
  userId: string,
  detailedResult: unknown,
) {
  try {
    const words = extractWordsFromDetailedResult(detailedResult);
    if (words.length === 0) return;

    const phonemeScores = new Map<string, number[]>();

    for (const word of words) {
      for (const phoneme of word.phonemes) {
        if (!Number.isFinite(phoneme.accuracyScore)) continue;
        const scores = phonemeScores.get(phoneme.phoneme) ?? [];
        scores.push(phoneme.accuracyScore);
        phonemeScores.set(phoneme.phoneme, scores);
      }
    }

    for (const [phoneme, scores] of phonemeScores) {
      const scoreTotal = scores.reduce((sum, score) => sum + score, 0);
      const existing = await db.phonemeWeakness.findUnique({
        where: { userId_phoneme: { userId, phoneme } },
      });
      const existingAttempts = existing?.attemptCount ?? 0;
      const totalAttempts = existingAttempts + scores.length;
      const totalScore = (existing?.avgScore ?? 0) * existingAttempts + scoreTotal;
      const avgScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;

      await db.phonemeWeakness.upsert({
        where: { userId_phoneme: { userId, phoneme } },
        create: {
          userId,
          phoneme,
          avgScore: scoreTotal / scores.length,
          attemptCount: scores.length,
          lastPracticedAt: new Date(),
        },
        update: {
          avgScore: { set: avgScore },
          attemptCount: { set: totalAttempts },
          lastPracticedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Failed to update phoneme weaknesses:", error);
  }
}

type StoredPhonemeScore = {
  phoneme: string;
  accuracyScore: number;
};

type StoredWordAssessment = {
  phonemes: StoredPhonemeScore[];
};

function extractWordsFromDetailedResult(
  detailedResult: unknown,
): StoredWordAssessment[] {
  if (!detailedResult || typeof detailedResult !== "object") {
    return [];
  }

  if (Array.isArray(detailedResult)) {
    return detailedResult.flatMap(extractWordCandidate);
  }

  return extractWordContainer(detailedResult as Record<string, unknown>);
}

function extractWordContainer(
  container: Record<string, unknown>,
): StoredWordAssessment[] {
  if (Array.isArray(container.words)) {
    return container.words.flatMap(extractWordCandidate);
  }

  if (Array.isArray(container.Words)) {
    return container.Words.flatMap(extractWordCandidate);
  }

  return extractWordCandidate(container);
}

function extractWordCandidate(candidate: unknown): StoredWordAssessment[] {
  if (!candidate || typeof candidate !== "object") {
    return [];
  }

  const record = candidate as Record<string, unknown>;

  if (Array.isArray(record.words) || Array.isArray(record.Words)) {
    return extractWordContainer(record);
  }

  const phonemes = extractPhonemes(record);
  return phonemes.length > 0 ? [{ phonemes }] : [];
}

function extractPhonemes(record: Record<string, unknown>): StoredPhonemeScore[] {
  if (Array.isArray(record.phonemes)) {
    return record.phonemes.flatMap(extractStoredPhoneme);
  }

  if (Array.isArray(record.Phonemes)) {
    return record.Phonemes.flatMap(extractStoredPhoneme);
  }

  return [];
}

function extractStoredPhoneme(candidate: unknown): StoredPhonemeScore[] {
  if (!candidate || typeof candidate !== "object") {
    return [];
  }

  const record = candidate as Record<string, unknown>;

  if (
    typeof record.phoneme === "string" &&
    typeof record.accuracyScore === "number"
  ) {
    return [
      {
        phoneme: record.phoneme,
        accuracyScore: record.accuracyScore,
      },
    ];
  }

  if (typeof record.Phoneme === "string") {
    const assessment =
      typeof record.PronunciationAssessment === "object" &&
      record.PronunciationAssessment !== null
        ? (record.PronunciationAssessment as Record<string, unknown>)
        : null;
    const accuracyScore =
      typeof assessment?.AccuracyScore === "number"
        ? assessment.AccuracyScore
        : null;

    if (accuracyScore !== null) {
      return [
        {
          phoneme: record.Phoneme,
          accuracyScore,
        },
      ];
    }
  }

  return [];
}
