"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Volume2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  PHONEME_COMBINATION_TIPS,
  PHONEME_TIPS,
  type PhonemeCombinationTip,
  type PhonemeTip,
} from "~/lib/pronunciation-tips-data";
import type { PhonemeAssessment, WordAssessment } from "~/types/assessment";

interface PronunciationTipsProps {
  word: WordAssessment;
}

const MAX_FOCUS_PHONEMES = 3;
const VOWEL_PHONEMES = new Set([
  "iː",
  "ɪ",
  "ɛ",
  "æ",
  "ʌ",
  "ə",
  "uː",
  "ʊ",
  "ɔː",
  "ɑː",
  "ɜːr",
  "ɪr",
  "ɛr",
  "ɑːr",
  "eɪ",
  "aɪ",
  "ɔɪ",
  "aʊ",
  "oʊ",
]);

export function PronunciationTips({ word }: PronunciationTipsProps) {
  if (word.phonemes.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-accent-green-dim/40 px-4 py-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green/20">
          <Lightbulb className="h-3.5 w-3.5 text-accent-green" />
        </div>
        <p className="text-sm text-accent-green">
          We didn&apos;t get phoneme-level detail for this word, so use the model
          audio and try another take.
        </p>
      </div>
    );
  }

  const focusPhonemes = getFocusPhonemes(word.phonemes);
  const weakestPhoneme = focusPhonemes[0];
  const wordLevelTips = getRelevantCombinationTips(word, focusPhonemes);
  const isMostlyStrong = weakestPhoneme ? weakestPhoneme.accuracyScore >= 88 : false;

  return (
    <div className="space-y-4">
      {weakestPhoneme && (
        <div className="flex items-start gap-3 rounded-lg border border-accent-blue/20 bg-accent-blue-dim/20 px-4 py-3.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/15">
            <Sparkles className="h-4 w-4 text-accent-blue" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {isMostlyStrong
                ? `This word is close — polish /${weakestPhoneme.phoneme}/ first.`
                : `Fix /${weakestPhoneme.phoneme}/ first for the biggest improvement.`}
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              {isMostlyStrong
                ? "Your scores are already pretty solid. Use the cues below to make the word sound cleaner and more natural."
                : "Slow the word down, exaggerate the weakest mouth shape on its own, then put it back into the whole word."}
            </p>
          </div>
        </div>
      )}

      {focusPhonemes.map((phoneme, index) => {
        const tip = PHONEME_TIPS[phoneme.phoneme] as PhonemeTip | undefined;
        return (
          <motion.div
            key={`${phoneme.phoneme}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
          >
            {tip ? (
              <TipCard phoneme={phoneme} tip={tip} targetWord={word.word} />
            ) : (
              <GenericTipCard phoneme={phoneme} targetWord={word.word} />
            )}
          </motion.div>
        );
      })}

      {wordLevelTips.length > 0 && (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-blue" />
            <p className="text-sm font-medium text-text-primary">
              Word-level coaching
            </p>
          </div>
          <div className="space-y-3">
            {wordLevelTips.map((tip) => (
              <CombinationTipCard key={tip.pattern} tip={tip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TipCard({
  phoneme,
  tip,
  targetWord,
}: {
  phoneme: PhonemeAssessment;
  tip: PhonemeTip;
  targetWord: string;
}) {
  const primaryAlternative = getPrimaryAlternative(phoneme);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-accent-amber-dim/60 px-1.5 py-0.5 font-mono text-sm font-bold text-accent-amber">
            /{phoneme.phoneme}/
          </span>
          <span className="text-sm font-medium text-text-primary">
            {tip.name}
          </span>
        </div>
        <span className="shrink-0 text-xs text-text-muted">
          Score: {Math.round(phoneme.accuracyScore)}
        </span>
      </div>

      {primaryAlternative && (
        <div className="flex gap-2 rounded-md bg-accent-red-dim/30 px-3 py-2.5">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-red" />
          <p className="text-sm leading-relaxed text-text-primary">
            Azure mostly heard{" "}
            <span className="font-mono">/{primaryAlternative.phoneme}/</span>{" "}
            instead of <span className="font-mono">/{phoneme.phoneme}/</span>.
            Exaggerate the target mouth shape before saying{" "}
            <span className="font-medium">&ldquo;{targetWord}&rdquo;</span> again.
          </p>
        </div>
      )}

      <p className="text-sm leading-relaxed text-text-secondary">
        {tip.description}
      </p>

      <div className="flex gap-2 rounded-md bg-accent-blue-dim/30 px-3 py-2.5">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue" />
        <p className="text-sm leading-relaxed text-text-primary">
          <span className="font-medium">Fix it now: </span>
          {tip.tip}
        </p>
      </div>

      <div className="flex items-start gap-2">
        <Volume2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Mouth: </span>
          {tip.mouthPosition}
        </p>
      </div>

      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-amber" />
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">
            Common mistake:{" "}
          </span>
          {tip.commonMistake}
        </p>
      </div>

      <div className="rounded-md bg-elevated px-3 py-2.5">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-medium text-text-primary">Quick drill: </span>
          Say <span className="font-medium">&ldquo;{tip.exampleWord}&rdquo;</span>{" "}
          slowly, keep the same mouth position, then repeat{" "}
          <span className="font-medium">&ldquo;{targetWord}&rdquo;</span> three
          times.
        </p>
      </div>

      {tip.commonFor.length > 0 && (
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Often tricky for: </span>
          {tip.commonFor.join(", ")}
        </p>
      )}

      {tip.practiceWords.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-text-muted">
            Practice words
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tip.practiceWords.map((word) => (
              <span
                key={word}
                className={cn(
                  "rounded-full border border-border px-2.5 py-0.5",
                  "text-xs text-text-secondary transition-colors",
                  "hover:border-accent-blue/40 hover:text-text-primary",
                )}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GenericTipCard({
  phoneme,
  targetWord,
}: {
  phoneme: PhonemeAssessment;
  targetWord: string;
}) {
  const primaryAlternative = getPrimaryAlternative(phoneme);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-accent-amber-dim/60 px-1.5 py-0.5 font-mono text-sm font-bold text-accent-amber">
          /{phoneme.phoneme}/
        </span>
        <span className="text-sm text-text-muted">
          Score: {Math.round(phoneme.accuracyScore)}
        </span>
      </div>

      <div className="space-y-2 rounded-md bg-elevated px-3 py-2.5">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue" />
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-text-secondary">
            {primaryAlternative ? (
              <>
                Azure mostly heard{" "}
                <span className="font-mono text-text-primary">
                  /{primaryAlternative.phoneme}/
                </span>{" "}
                instead of{" "}
                <span className="font-mono text-text-primary">
                  /{phoneme.phoneme}/
                </span>
                .
              </>
            ) : (
              <>
                This sound is still unstable inside{" "}
                <span className="font-medium text-text-primary">
                  &ldquo;{targetWord}&rdquo;
                </span>
                .
              </>
            )}
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-text-secondary">
            <li>Say /{phoneme.phoneme}/ by itself three times first.</li>
            <li>Exaggerate your lip and tongue placement on the next take.</li>
            <li>Play back your recording and compare it with the model audio.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CombinationTipCard({ tip }: { tip: PhonemeCombinationTip }) {
  return (
    <div className="space-y-2 rounded-lg border border-border-subtle bg-elevated px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-primary">{tip.description}</p>
        <span className="rounded bg-surface px-2 py-0.5 font-mono text-xs text-text-muted">
          {tip.pattern}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{tip.tip}</p>
      <div className="flex flex-wrap gap-1.5">
        {tip.examples.map((example) => (
          <span
            key={example}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary"
          >
            {example}
          </span>
        ))}
      </div>
    </div>
  );
}

function getFocusPhonemes(phonemes: PhonemeAssessment[]) {
  const sorted = [...phonemes].sort(
    (left, right) => left.accuracyScore - right.accuracyScore,
  );
  const belowTarget = sorted.filter((phoneme) => phoneme.accuracyScore < 88);
  return (belowTarget.length > 0 ? belowTarget : sorted).slice(
    0,
    MAX_FOCUS_PHONEMES,
  );
}

function getPrimaryAlternative(phoneme: PhonemeAssessment) {
  return phoneme.detectedAs.find(
    (candidate) => candidate.phoneme !== phoneme.phoneme,
  );
}

function getRelevantCombinationTips(
  word: WordAssessment,
  focusPhonemes: PhonemeAssessment[],
) {
  const phonemeSequence = word.phonemes.map((phoneme) => phoneme.phoneme).join("");
  const matches: PhonemeCombinationTip[] = [];

  const addMatch = (pattern: string) => {
    const match = PHONEME_COMBINATION_TIPS.find((tip) => tip.pattern === pattern);
    if (match && !matches.some((tip) => tip.pattern === match.pattern)) {
      matches.push(match);
    }
  };

  if (phonemeSequence.includes("θɹ") || phonemeSequence.includes("θr")) {
    addMatch("θr");
  }
  if (phonemeSequence.includes("stɹ") || phonemeSequence.includes("str")) {
    addMatch("str");
  }
  if (phonemeSequence.includes("sts")) {
    addMatch("sts");
  }
  if (phonemeSequence.includes("sks")) {
    addMatch("sks");
  }
  if (phonemeSequence.includes("lð") || phonemeSequence.includes("lθ")) {
    addMatch("lð");
  }
  if (hasConfusion(focusPhonemes, "ɹ", "l")) {
    addMatch("ɹ vs l");
  }
  if (hasConfusion(focusPhonemes, "w", "v")) {
    addMatch("w vs v");
  }
  if (hasFinalCluster(word.phonemes)) {
    addMatch("Final clusters");
  }
  if (word.syllables.length > 1) {
    addMatch("Word stress");
  }
  if (word.phonemes.some((phoneme) => phoneme.phoneme === "ə")) {
    addMatch("Schwa reduction");
  }
  if (hasAmericanFlapPattern(word.phonemes)) {
    addMatch("American T flapping");
  }

  return matches.slice(0, 2);
}

function hasConfusion(
  phonemes: PhonemeAssessment[],
  primary: string,
  alternative: string,
) {
  return phonemes.some((phoneme) => {
    const detectedAlternative = getPrimaryAlternative(phoneme)?.phoneme;
    return (
      phoneme.phoneme === primary ||
      phoneme.phoneme === alternative ||
      detectedAlternative === primary ||
      detectedAlternative === alternative
    );
  });
}

function hasFinalCluster(phonemes: PhonemeAssessment[]) {
  let trailingConsonants = 0;

  for (let index = phonemes.length - 1; index >= 0; index -= 1) {
    const phoneme = phonemes[index]?.phoneme ?? "";
    if (isVowelPhoneme(phoneme)) {
      break;
    }
    trailingConsonants += 1;
  }

  return trailingConsonants >= 2;
}

function hasAmericanFlapPattern(phonemes: PhonemeAssessment[]) {
  return phonemes.some((phoneme, index) => {
    if (phoneme.phoneme !== "t") {
      return false;
    }

    const previous = phonemes[index - 1]?.phoneme ?? "";
    const next = phonemes[index + 1]?.phoneme ?? "";

    return isVowelPhoneme(previous) && isVowelPhoneme(next);
  });
}

function isVowelPhoneme(phoneme: string) {
  return VOWEL_PHONEMES.has(phoneme);
}
