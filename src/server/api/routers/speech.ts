import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";

let cachedToken: { token: string; expiresAt: number } | null = null;

export const speechRouter = createTRPCRouter({
  getToken: protectedProcedure.query(async () => {
    // Return cached token if still valid (with 1 min buffer)
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
      return { token: cachedToken.token, region: env.AZURE_SPEECH_REGION };
    }

    const response = await fetch(
      `https://${env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get Azure speech token: ${response.statusText}`,
      );
    }

    const token = await response.text();

    // Cache for 9 minutes (token expires in 10)
    cachedToken = { token, expiresAt: Date.now() + 9 * 60 * 1000 };

    return { token, region: env.AZURE_SPEECH_REGION };
  }),
});
