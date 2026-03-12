// Raw Azure response types
export interface AzurePronunciationResult {
  Id: string;
  RecognitionStatus: number;
  Offset: number;
  Duration: number;
  DisplayText: string;
  NBest: AzureNBestResult[];
}

export interface AzureNBestResult {
  Confidence: number;
  Lexical: string;
  ITN: string;
  MaskedITN: string;
  Display: string;
  PronunciationAssessment: AzureOverallScores;
  Words: AzureWordResult[];
}

export interface AzureOverallScores {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronScore: number;
}

export interface AzureWordResult {
  Word: string;
  Offset: number;
  Duration: number;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType:
      | "None"
      | "Mispronunciation"
      | "Omission"
      | "Insertion"
      | "UnexpectedBreak"
      | "MissingBreak"
      | "Monotone";
  };
  Syllables: AzureSyllableResult[];
  Phonemes: AzurePhonemeResult[];
}

export interface AzureSyllableResult {
  Syllable: string;
  PronunciationAssessment: {
    AccuracyScore: number;
  };
  Offset: number;
  Duration: number;
}

export interface AzurePhonemeResult {
  Phoneme: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    NBestPhonemes: AzureNBestPhoneme[];
  };
  Offset: number;
  Duration: number;
}

export interface AzureNBestPhoneme {
  Phoneme: string;
  Score: number;
}

// Parsed types for our UI
export interface AssessmentResult {
  overallScores: OverallScores;
  words: WordAssessment[];
  recognizedText: string;
  referenceText: string;
}

export interface OverallScores {
  accuracy: number;
  fluency: number;
  completeness: number;
  pronunciation: number;
}

export interface WordAssessment {
  word: string;
  offsetMs: number;
  durationMs: number;
  accuracyScore: number;
  errorType:
    | "none"
    | "mispronunciation"
    | "omission"
    | "insertion"
    | "unexpected_break"
    | "missing_break"
    | "monotone";
  syllables: SyllableAssessment[];
  phonemes: PhonemeAssessment[];
}

export interface SyllableAssessment {
  syllable: string;
  offsetMs: number;
  durationMs: number;
  accuracyScore: number;
}

export interface PhonemeAssessment {
  phoneme: string;
  offsetMs: number;
  durationMs: number;
  accuracyScore: number;
  detectedAs: { phoneme: string; score: number }[];
}
