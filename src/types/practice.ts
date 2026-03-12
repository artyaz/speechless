export type PracticeType =
  | "sentence"
  | "short"
  | "long"
  | "word_drill"
  | "minimal_pairs"
  | "tongue_twister";

export interface PracticeTypeConfig {
  type: PracticeType;
  label: string;
  description: string;
  estimatedTime: string;
  icon: string;
  wordCountRange: [number, number];
}

export const PRACTICE_TYPES: PracticeTypeConfig[] = [
  {
    type: "sentence",
    label: "Quick Sentence",
    description: "Practice a single sentence. Fast and focused.",
    estimatedTime: "~30s",
    icon: "Zap",
    wordCountRange: [5, 15],
  },
  {
    type: "short",
    label: "Short Paragraph",
    description: "A few sentences for balanced practice.",
    estimatedTime: "~1-2 min",
    icon: "AlignLeft",
    wordCountRange: [20, 60],
  },
  {
    type: "long",
    label: "Long Passage",
    description: "Extended reading for fluency training.",
    estimatedTime: "~3-5 min",
    icon: "FileText",
    wordCountRange: [80, 200],
  },
  {
    type: "word_drill",
    label: "Word Drill",
    description: "Individual words targeting problem sounds.",
    estimatedTime: "~1 min",
    icon: "Target",
    wordCountRange: [10, 20],
  },
  {
    type: "minimal_pairs",
    label: "Minimal Pairs",
    description:
      "Word pairs that differ by one sound. ship/sheep, light/right.",
    estimatedTime: "~2 min",
    icon: "ArrowLeftRight",
    wordCountRange: [10, 20],
  },
  {
    type: "tongue_twister",
    label: "Tongue Twisters",
    description: "Fun phoneme-dense phrases for intensive practice.",
    estimatedTime: "~1 min",
    icon: "Flame",
    wordCountRange: [5, 30],
  },
];

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
