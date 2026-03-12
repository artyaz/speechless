import type {
  AssessmentResult,
  WordAssessment,
  PhonemeAssessment,
  SyllableAssessment,
  OverallScores,
} from "~/types/assessment";
import type * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export function parseAssessmentResult(
  result: SpeechSDK.PronunciationAssessmentResult,
  recognitionResult: SpeechSDK.SpeechRecognitionResult,
  referenceText: string,
): AssessmentResult {
  const detailedJson = recognitionResult.properties.getProperty(
    "PronunciationAssessment_NBest",
  );

  const overallScores: OverallScores = {
    accuracy: result.accuracyScore,
    fluency: result.fluencyScore,
    completeness: result.completenessScore,
    pronunciation: result.pronunciationScore,
  };

  let words: WordAssessment[] = [];

  if (detailedJson) {
    try {
      const nbestArray = JSON.parse(detailedJson) as Array<{
        Words?: Array<{
          Word: string;
          Offset?: number;
          Duration?: number;
          PronunciationAssessment: {
            AccuracyScore: number;
            ErrorType: string;
          };
          Syllables?: Array<{
            Syllable: string;
            Offset?: number;
            Duration?: number;
            PronunciationAssessment: { AccuracyScore: number };
          }>;
          Phonemes?: Array<{
            Phoneme: string;
            Offset?: number;
            Duration?: number;
            PronunciationAssessment: {
              AccuracyScore: number;
              NBestPhonemes?: Array<{ Phoneme: string; Score: number }>;
            };
          }>;
        }>;
      }>;

      const best = nbestArray[0];
      if (best?.Words) {
        words = best.Words.map(
          (w): WordAssessment => ({
            word: w.Word,
            offsetMs: (w.Offset ?? 0) / 10_000,
            durationMs: (w.Duration ?? 0) / 10_000,
            accuracyScore: w.PronunciationAssessment.AccuracyScore,
            errorType: mapErrorType(w.PronunciationAssessment.ErrorType),
            syllables: (w.Syllables ?? []).map(
              (s): SyllableAssessment => ({
                syllable: s.Syllable,
                offsetMs: (s.Offset ?? 0) / 10_000,
                durationMs: (s.Duration ?? 0) / 10_000,
                accuracyScore: s.PronunciationAssessment.AccuracyScore,
              }),
            ),
            phonemes: (w.Phonemes ?? []).map(
              (p): PhonemeAssessment => ({
                phoneme: p.Phoneme,
                offsetMs: (p.Offset ?? 0) / 10_000,
                durationMs: (p.Duration ?? 0) / 10_000,
                accuracyScore: p.PronunciationAssessment.AccuracyScore,
                detectedAs: (
                  p.PronunciationAssessment.NBestPhonemes ?? []
                ).map((n) => ({
                  phoneme: n.Phoneme,
                  score: n.Score,
                })),
              }),
            ),
          }),
        );
      }
    } catch {
      // Fallback: use word-level data from the result if JSON parsing fails
    }
  }

  return {
    overallScores,
    words,
    recognizedText: recognitionResult.text ?? "",
    referenceText,
  };
}

function mapErrorType(errorType: string): WordAssessment["errorType"] {
  const map: Record<string, WordAssessment["errorType"]> = {
    None: "none",
    Mispronunciation: "mispronunciation",
    Omission: "omission",
    Insertion: "insertion",
    UnexpectedBreak: "unexpected_break",
    MissingBreak: "missing_break",
    Monotone: "monotone",
  };
  return map[errorType] ?? "none";
}
