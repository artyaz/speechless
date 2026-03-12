import { GoogleGenAI } from "@google/genai";
import { env } from "~/env";
import type { PracticeType, DifficultyLevel } from "~/types/practice";

type TextGenerationProvider = "gemini" | "groq";

const DEFAULT_MODELS: Record<TextGenerationProvider, string> = {
  gemini: "gemini-3-flash-preview",
  groq: "openai/gpt-oss-120b",
};

const inFlightGenerationRequests = new Map<string, Promise<string>>();
let groqQueue: Promise<void> = Promise.resolve();

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  beginner:
    "Use simple, common everyday words. Short sentences. Basic vocabulary that a beginner English learner would know.",
  intermediate:
    "Use a mix of common and moderately complex words. Natural conversational American English. Some multi-syllable words.",
  advanced:
    "Use sophisticated vocabulary, complex sentence structures, and words with challenging phoneme combinations. Academic or professional level.",
};

function getLearnerContext(nativeLanguage?: string | null) {
  return nativeLanguage
    ? `The learner's native language is ${nativeLanguage}. Keep the exercise fully in English, but prioritize words and sound contrasts that are especially useful for ${nativeLanguage} speakers.`
    : "Keep the exercise fully in English for a general non-native learner.";
}

const TYPE_PROMPTS: Record<
  PracticeType,
  (difficulty: string, learnerContext: string, targetPhonemes?: string[]) => string
> = {
  sentence: (difficulty, learnerContext, targetPhonemes) => {
    const phonemeInstruction = targetPhonemes?.length
      ? `The sentence MUST contain words that feature these sounds: ${targetPhonemes.join(", ")}.`
      : "Include words with commonly mispronounced sounds (th, r, l, v, w, vowel distinctions).";
    return `Generate a single natural English sentence (8-15 words) for pronunciation practice. ${phonemeInstruction} ${difficulty} ${learnerContext} Return ONLY the sentence, nothing else. No quotes.`;
  },
  short: (difficulty, learnerContext, targetPhonemes) => {
    const phonemeInstruction = targetPhonemes?.length
      ? `Include words featuring these sounds: ${targetPhonemes.join(", ")}.`
      : "";
    return `Generate a short paragraph (3-4 sentences, 30-50 words) for English pronunciation practice. Use natural, conversational American English. ${phonemeInstruction} ${difficulty} ${learnerContext} Return ONLY the paragraph, nothing else. No quotes.`;
  },
  long: (difficulty, learnerContext, targetPhonemes) => {
    const phonemeInstruction = targetPhonemes?.length
      ? `Include words featuring these sounds: ${targetPhonemes.join(", ")}.`
      : "";
    return `Generate a passage (6-8 sentences, 80-150 words) for English pronunciation practice and fluency training. Use natural American English about an interesting topic. ${phonemeInstruction} ${difficulty} ${learnerContext} Return ONLY the passage, nothing else. No quotes.`;
  },
  word_drill: (difficulty, learnerContext, targetPhonemes) => {
    const phonemeInstruction = targetPhonemes?.length
      ? `Focus on words containing these sounds: ${targetPhonemes.join(", ")}.`
      : "Focus on commonly mispronounced words (with th, r, l, v/w, vowel pairs).";
    return `Generate a list of 15 individual English words for pronunciation drill practice. ${phonemeInstruction} ${difficulty} ${learnerContext} Return ONLY the words separated by spaces on a single line. No numbering, no commas, no quotes.`;
  },
  minimal_pairs: (difficulty, learnerContext) => {
    return `Generate 10 minimal pair word sets for English pronunciation practice. Each pair should differ by exactly one phoneme. Cover various contrasts: ship/sheep, light/right, bet/bat, full/fool, van/ban, etc. ${difficulty} ${learnerContext} Return as pairs separated by " / " with each pair on the same line, pairs separated by newlines. Example format:
ship / sheep
light / right
No numbering, no other text.`;
  },
  tongue_twister: (difficulty, learnerContext) => {
    return `Generate 2 fun tongue twisters for English pronunciation practice. They should be challenging but not impossibly long (1-2 sentences each). Focus on repeated difficult sounds. ${difficulty} ${learnerContext} Return ONLY the tongue twisters separated by a newline. No numbering, no quotes, no other text.`;
  },
};

export async function generatePracticeText(
  type: PracticeType,
  difficulty: DifficultyLevel = "intermediate",
  targetPhonemes?: string[],
  nativeLanguage?: string | null,
): Promise<string> {
  const difficultyDesc = DIFFICULTY_DESCRIPTIONS[difficulty];
  const learnerContext = getLearnerContext(nativeLanguage);
  const prompt = TYPE_PROMPTS[type](difficultyDesc, learnerContext, targetPhonemes);
  const provider = env.LLM_PROVIDER;
  const model = env.LLM_MODEL ?? DEFAULT_MODELS[provider];
  const requestKey = JSON.stringify({
    provider,
    model,
    type,
    difficulty,
    targetPhonemes: targetPhonemes ?? [],
    nativeLanguage: nativeLanguage ?? null,
  });

  const existingRequest = inFlightGenerationRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest;
  }

  const generationTask = async () => {
    const rawText =
      provider === "groq"
        ? await generateWithGroq(prompt, model)
        : await generateWithGemini(prompt, model);

    return normalizeGeneratedText(rawText);
  };

  const requestPromise = (
    provider === "groq" ? enqueueGroqGeneration(generationTask) : generationTask()
  ).finally(() => {
    inFlightGenerationRequests.delete(requestKey);
  });

  inFlightGenerationRequests.set(requestKey, requestPromise);
  return requestPromise;
}

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is required when LLM_PROVIDER is set to gemini.",
    );
  }

  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

async function generateWithGemini(prompt: string, model: string) {
  const response = await getGeminiClient().models.generateContent({
    model,
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

async function generateWithGroq(prompt: string, model: string) {
  if (!env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is required when LLM_PROVIDER is set to groq.",
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You generate clean pronunciation practice content. Return only the requested exercise text with no preamble, labels, or quotes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Groq text generation failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}

function enqueueGroqGeneration<T>(task: () => Promise<T>) {
  const queuedTask = groqQueue.then(task, task);
  groqQueue = queuedTask.then(
    () => undefined,
    () => undefined,
  );
  return queuedTask;
}

function normalizeGeneratedText(text: string) {
  return text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\n{3,}/g, "\n\n");
}
