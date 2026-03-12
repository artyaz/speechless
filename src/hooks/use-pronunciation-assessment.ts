// PRIVACY: Audio is processed client-side by Azure Speech SDK. No audio data is sent to our server.
"use client";

import { useState, useCallback } from "react";
import { api } from "~/trpc/react";
import type {
  AssessmentResult,
  WordAssessment,
} from "~/types/assessment";
import type * as SpeechSDKModule from "microsoft-cognitiveservices-speech-sdk";

type SpeechSDKType = typeof SpeechSDKModule;

async function getAzureSpeechSDK(): Promise<SpeechSDKType> {
  return await import("microsoft-cognitiveservices-speech-sdk");
}

interface AzureJsonResponse {
  NBest?: Array<{
    Words?: Array<{
      Word: string;
      Offset?: number;
      Duration?: number;
      PronunciationAssessment?: {
        AccuracyScore?: number;
        ErrorType?: string;
      };
      Syllables?: Array<{
        Syllable: string;
        Offset?: number;
        Duration?: number;
        PronunciationAssessment?: { AccuracyScore?: number };
      }>;
      Phonemes?: Array<{
        Phoneme: string;
        Offset?: number;
        Duration?: number;
        PronunciationAssessment?: {
          AccuracyScore?: number;
          NBestPhonemes?: Array<{ Phoneme: string; Score: number }>;
        };
      }>;
    }>;
  }>;
}

const ERROR_TYPE_MAP: Record<string, WordAssessment["errorType"]> = {
  none: "none",
  mispronunciation: "mispronunciation",
  omission: "omission",
  insertion: "insertion",
  unexpectedbreak: "unexpected_break",
  missingbreak: "missing_break",
  monotone: "monotone",
};

function mapErrorType(raw: string | undefined): WordAssessment["errorType"] {
  return ERROR_TYPE_MAP[raw?.toLowerCase() ?? "none"] ?? "none";
}

export interface UsePronunciationAssessmentReturn {
  assess: (
    audioBlob: Blob,
    referenceText: string,
  ) => Promise<AssessmentResult | null>;
  isAssessing: boolean;
  result: AssessmentResult | null;
  error: string | null;
  reset: () => void;
}

export function usePronunciationAssessment(): UsePronunciationAssessmentReturn {
  const [isAssessing, setIsAssessing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenQuery = api.speech.getToken.useQuery(undefined, {
    staleTime: 8 * 60 * 1000, // 8 min (token lasts ~10 min)
    refetchOnWindowFocus: false,
  });

  const assess = useCallback(
    async (
      audioBlob: Blob,
      referenceText: string,
    ): Promise<AssessmentResult | null> => {
      try {
        setIsAssessing(true);
        setError(null);

        // Get token
        let tokenData = tokenQuery.data;
        if (!tokenData) {
          const refetched = await tokenQuery.refetch();
          tokenData = refetched.data;
        }
        if (!tokenData) throw new Error("Failed to get speech token");

        const SpeechSDK = await getAzureSpeechSDK();

        // Create speech config from token
        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
          tokenData.token,
          tokenData.region,
        );
        speechConfig.speechRecognitionLanguage = "en-US";

        // Pronunciation assessment config — phoneme level
        const pronConfig = new SpeechSDK.PronunciationAssessmentConfig(
          referenceText,
          SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
          SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
          true, // enableMiscue
        );
        pronConfig.nbestPhonemeCount = 5;
        pronConfig.enableProsodyAssessment = true;

        if (audioBlob.size === 0) {
          throw new Error("The recording is empty. Please try again.");
        }

        const audioFile = new File(
          [audioBlob],
          "speechless-recording.wav",
          {
            type: audioBlob.type || "audio/wav",
          },
        );
        const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);
        const recognizer = new SpeechSDK.SpeechRecognizer(
          speechConfig,
          audioConfig,
        );
        pronConfig.applyTo(recognizer);

        // Recognize
        const recognitionResult =
          await new Promise<SpeechSDKModule.SpeechRecognitionResult>(
            (resolve, reject) => {
              recognizer.recognizeOnceAsync(
                (res) => {
                  recognizer.close();
                  resolve(res);
                },
                (err) => {
                  recognizer.close();
                  reject(new Error(String(err)));
                },
              );
            },
          );

        if (recognitionResult.reason === SpeechSDK.ResultReason.NoMatch) {
          throw new Error(
            "We couldn't hear clear speech in that recording. Check your mic and try again.",
          );
        }

        if (recognitionResult.reason === SpeechSDK.ResultReason.Canceled) {
          const details =
            SpeechSDK.CancellationDetails.fromResult(recognitionResult);
          throw new Error(
            details.errorDetails ||
              "Speech recognition was canceled. Please try again.",
          );
        }

        // Parse pronunciation assessment result
        const pronResult =
          SpeechSDK.PronunciationAssessmentResult.fromResult(recognitionResult);

        // Extract detailed JSON from properties
        const jsonStr = recognitionResult.properties?.getProperty(
          "SpeechServiceResponse_JsonResult",
        );
        let words: AssessmentResult["words"] = [];

        if (jsonStr) {
          try {
            const json = JSON.parse(jsonStr) as AzureJsonResponse;
            const nbest = json.NBest?.[0];
            if (nbest?.Words) {
              words = nbest.Words.map((w) => ({
                word: w.Word,
                offsetMs: (w.Offset ?? 0) / 10_000,
                durationMs: (w.Duration ?? 0) / 10_000,
                accuracyScore:
                  w.PronunciationAssessment?.AccuracyScore ?? 0,
                errorType: mapErrorType(
                  w.PronunciationAssessment?.ErrorType,
                ),
                syllables: (w.Syllables ?? []).map((s) => ({
                  syllable: s.Syllable,
                  offsetMs: (s.Offset ?? 0) / 10_000,
                  durationMs: (s.Duration ?? 0) / 10_000,
                  accuracyScore:
                    s.PronunciationAssessment?.AccuracyScore ?? 0,
                })),
                phonemes: (w.Phonemes ?? []).map((p) => ({
                  phoneme: p.Phoneme,
                  offsetMs: (p.Offset ?? 0) / 10_000,
                  durationMs: (p.Duration ?? 0) / 10_000,
                  accuracyScore:
                    p.PronunciationAssessment?.AccuracyScore ?? 0,
                  detectedAs: (
                    p.PronunciationAssessment?.NBestPhonemes ?? []
                  ).map((n) => ({
                    phoneme: n.Phoneme,
                    score: n.Score,
                  })),
                })),
              }));
            }
          } catch {
            // JSON parsing failed, continue with empty words
          }
        }

        if (!recognitionResult.text?.trim() && words.length === 0) {
          throw new Error(
            "We heard audio, but couldn't match it to the practice text. Try again a little slower and closer to the mic.",
          );
        }

        const assessmentResult: AssessmentResult = {
          overallScores: {
            accuracy: pronResult.accuracyScore,
            fluency: pronResult.fluencyScore,
            completeness: pronResult.completenessScore,
            pronunciation: pronResult.pronunciationScore,
          },
          words,
          recognizedText: recognitionResult.text ?? "",
          referenceText,
        };

        setResult(assessmentResult);
        return assessmentResult;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Assessment failed";
        setError(message);
        return null;
      } finally {
        setIsAssessing(false);
      }
    },
    [tokenQuery],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { assess, isAssessing, result, error, reset };
}
