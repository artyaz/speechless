"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { PRACTICE_TYPES, type PracticeType } from "~/types/practice";
import type { AssessmentResult, WordAssessment } from "~/types/assessment";
import { usePronunciationAssessment } from "~/hooks/use-pronunciation-assessment";
import { cn } from "~/lib/utils";
import { TextDisplay } from "~/components/practice/text-display";
import { AudioRecorder } from "~/components/practice/audio-recorder";
import { ResultsView } from "~/components/practice/results-view";
import { SessionSummary } from "~/components/practice/session-summary";
import { PhonemeDetailSheet } from "~/components/practice/phoneme-detail-sheet";
import { LoadingSpinner } from "~/components/shared/loading-spinner";

type SessionState =
  | "loading"
  | "ready"
  | "recording"
  | "assessing"
  | "results"
  | "summary";

export default function PracticeSessionPage() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const utils = api.useUtils();

  const practiceType = params.type as PracticeType;
  const typeConfig = useMemo(
    () => PRACTICE_TYPES.find((t) => t.type === practiceType),
    [practiceType],
  );

  const [state, setState] = useState<SessionState>("loading");
  const [generatedText, setGeneratedText] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordAssessment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sourceRecordingBlob, setSourceRecordingBlob] = useState<Blob | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const isGeneratingRef = useRef(false);
  const hasSavedSessionRef = useRef(false);
  const sourceRecordingBlobRef = useRef<Blob | null>(null);

  const generateText = api.practice.generateText.useMutation();
  const saveSession = api.practice.saveSession.useMutation();
  const {
    assess,
    error: assessmentError,
    result: assessmentResult,
    reset: resetAssessment,
  } = usePronunciationAssessment();

  // Redirect if invalid type
  useEffect(() => {
    if (!typeConfig) {
      router.replace("/practice");
    }
  }, [typeConfig, router]);

  useEffect(() => {
    sourceRecordingBlobRef.current = sourceRecordingBlob;
  }, [sourceRecordingBlob]);

  const clearEphemeralPracticeData = useCallback(() => {
    sourceRecordingBlobRef.current = null;
    setSelectedWord(null);
    setSheetOpen(false);
    setSourceRecordingBlob(null);
  }, []);

  const persistSession = useCallback(
    async (result: AssessmentResult) => {
      if (hasSavedSessionRef.current) {
        return;
      }

      try {
        await saveSession.mutateAsync({
          type: practiceType,
          referenceText: generatedText,
          recognizedText: result.recognizedText,
          accuracyScore: result.overallScores.accuracy,
          fluencyScore: result.overallScores.fluency,
          completenessScore: result.overallScores.completeness,
          pronScore: result.overallScores.pronunciation,
          detailedResult: result,
        });
        hasSavedSessionRef.current = true;
        await Promise.all([
          utils.practice.getStats.invalidate(),
          utils.practice.getHistory.invalidate(),
        ]);
      } catch {
        hasSavedSessionRef.current = false;
      }
    },
    [generatedText, practiceType, saveSession, utils],
  );

  useEffect(() => {
    const handlePageExit = () => {
      sourceRecordingBlobRef.current = null;
    };

    window.addEventListener("pagehide", handlePageExit);
    window.addEventListener("beforeunload", handlePageExit);

    return () => {
      window.removeEventListener("pagehide", handlePageExit);
      window.removeEventListener("beforeunload", handlePageExit);
      handlePageExit();
    };
  }, []);

  // Generate text on mount
  const loadText = useCallback(async () => {
    if (isGeneratingRef.current) {
      return;
    }

    isGeneratingRef.current = true;
    setIsGeneratingText(true);
    setState("loading");
    generateText.reset();
    resetAssessment();
    clearEphemeralPracticeData();
    hasSavedSessionRef.current = false;

    try {
      const res = await generateText.mutateAsync({
        type: practiceType,
      });
      setGeneratedText(res.text);
      setState("ready");
    } catch {
      // keep loading state — error shown via mutation
    } finally {
      isGeneratingRef.current = false;
      setIsGeneratingText(false);
    }
  }, [practiceType, generateText, resetAssessment, clearEphemeralPracticeData]);

  useEffect(() => {
    if (typeConfig) {
      void loadText();
    }
    // Only run on mount / type change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceType, typeConfig]);

  // Handle recording complete → assess
  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      setState("assessing");
      setSourceRecordingBlob(blob);
      hasSavedSessionRef.current = false;
      const nextAssessment = await assess(blob, generatedText);
      if (!nextAssessment) {
        setState("ready");
        return;
      }

      await persistSession(nextAssessment);
      setState("results");
    },
    [assess, generatedText, persistSession],
  );

  // Try again: same text, re-record
  const handleRetry = useCallback(() => {
    resetAssessment();
    clearEphemeralPracticeData();
    hasSavedSessionRef.current = false;
    setState("ready");
  }, [clearEphemeralPracticeData, resetAssessment]);

  // New text: generate fresh
  const handleNewText = useCallback(() => {
    if (isGeneratingText) {
      return;
    }
    void loadText();
  }, [isGeneratingText, loadText]);

  // Finish: ensure the session is persisted, then show summary.
  const handleFinish = useCallback(async () => {
    if (!assessmentResult) return;
    if (!hasSavedSessionRef.current) {
      await persistSession(assessmentResult);
    }

    setState("summary");
  }, [assessmentResult, persistSession]);

  // Word click → detail sheet
  const handleWordClick = useCallback((word: WordAssessment) => {
    setSelectedWord(word);
    setSheetOpen(true);
  }, []);

  if (!typeConfig) return null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top bar */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/practice")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-elevated"
        >
          <ArrowLeft className="h-4 w-4 text-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-text-primary">
            {typeConfig.label}
          </h1>
          <p className="text-xs text-text-muted">{typeConfig.estimatedTime}</p>
        </div>
        {(state === "ready" || state === "recording") && (
          <button
            type="button"
            onClick={handleNewText}
            disabled={isGeneratingText}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:opacity-50"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                isGeneratingText && "animate-spin",
              )}
            />
            New Text
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Loading */}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-12"
          >
            {generateText.isError ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-red/10">
                  <AlertCircle className="h-6 w-6 text-accent-red" />
                </div>
                <p className="text-sm text-text-muted">
                  Failed to generate text
                </p>
                <button
                  type="button"
                  onClick={handleNewText}
                  disabled={isGeneratingText}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-elevated"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <LoadingSpinner size="lg" />
                <p className="text-sm text-text-muted">
                  {isGeneratingText ? "Generating practice text…" : "Preparing practice text…"}
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Ready / Recording */}
        {(state === "ready" || state === "recording") && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <TextDisplay
              text={generatedText}
              practiceType={practiceType}
              isActive={state === "recording"}
            />
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              isDisabled={state !== "ready" && state !== "recording"}
            />
            {assessmentError && (
              <p className="text-center text-sm text-accent-red">
                {assessmentError}
              </p>
            )}
          </motion.div>
        )}

        {/* Assessing */}
        {state === "assessing" && (
          <motion.div
            key="assessing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-12"
          >
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-muted">
              Analyzing your pronunciation…
            </p>
          </motion.div>
        )}

        {/* Results */}
        {state === "results" && assessmentResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ResultsView
              result={assessmentResult}
              onWordClick={handleWordClick}
              onRetry={handleRetry}
              onFinish={handleFinish}
            />
          </motion.div>
        )}

        {/* Summary */}
        {state === "summary" && assessmentResult && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SessionSummary
              result={assessmentResult}
              practiceType={practiceType}
              onPracticeAgain={handleNewText}
              onGoToDashboard={() => router.push("/dashboard")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phoneme detail sheet */}
      <PhonemeDetailSheet
        word={selectedWord}
        sourceAudioBlob={sourceRecordingBlob}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
