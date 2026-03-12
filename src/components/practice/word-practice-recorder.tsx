"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw } from "lucide-react";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";
import { useAudioRecorder } from "~/hooks/use-audio-recorder";
import { usePronunciationAssessment } from "~/hooks/use-pronunciation-assessment";
import { LoadingSpinner } from "~/components/shared/loading-spinner";

interface WordPracticeRecorderProps {
  word: string;
}

type RecorderState = "idle" | "starting" | "recording" | "assessing" | "result";

export function WordPracticeRecorder({ word }: WordPracticeRecorderProps) {
  const {
    isStarting,
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useAudioRecorder();
  const {
    assess,
    isAssessing,
    result,
    error: assessError,
    reset: resetAssessment,
  } = usePronunciationAssessment();

  const [state, setState] = useState<RecorderState>("idle");

  // Sync external state
  useEffect(() => {
    if (isStarting) setState("starting");
    else if (isRecording) setState("recording");
    else if (isAssessing) setState("assessing");
    else if (result) setState("result");
  }, [isStarting, isRecording, isAssessing, result]);

  // Auto-assess when recording stops and blob is ready
  useEffect(() => {
    if (!isRecording && audioBlob && state === "recording") {
      setState("assessing");
      void assess(audioBlob, word).then((assessment) => {
        if (!assessment) {
          setState("idle");
        }
      });
    }
  }, [isRecording, audioBlob, state, assess, word]);

  useEffect(() => {
    if (recorderError && !isStarting && !isRecording && !audioBlob && !isAssessing) {
      setState("idle");
    }
  }, [audioBlob, isAssessing, isRecording, isStarting, recorderError]);

  const handleRecord = useCallback(async () => {
    resetAssessment();
    resetRecording();
    const started = await startRecording();
    setState(started ? "starting" : "idle");
  }, [resetAssessment, resetRecording, startRecording]);

  const handleStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleTryAgain = useCallback(() => {
    resetAssessment();
    resetRecording();
    setState("idle");
  }, [resetAssessment, resetRecording]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${s}s`;
  };

  const error = recorderError ?? assessError;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {/* Idle state */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleRecord}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                "bg-accent-green/15 text-accent-green transition-all",
                "hover:bg-accent-green/25 hover:scale-105 active:scale-95",
              )}
              aria-label="Start recording"
            >
              <Mic className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Practice saying &ldquo;{word}&rdquo;
              </p>
              <p className="text-xs text-text-muted">
                Tap to record your pronunciation
              </p>
            </div>
          </motion.div>
        )}

        {state === "starting" && (
          <motion.div
            key="starting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-2"
          >
            <LoadingSpinner size="md" />
            <span className="text-sm text-text-secondary">
              Starting microphone…
            </span>
          </motion.div>
        )}

        {/* Recording state */}
        {state === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleStop}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                "bg-accent-red/20 text-accent-red transition-all",
                "hover:bg-accent-red/30 active:scale-95",
              )}
              aria-label="Stop recording"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
            <div className="flex items-center gap-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-accent-red"
                animate={{ opacity: [1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <span className="font-mono text-sm text-text-secondary">
                {formatTime(duration)}
              </span>
              <span className="text-xs text-text-muted">Recording…</span>
            </div>
          </motion.div>
        )}

        {/* Assessing state */}
        {state === "assessing" && (
          <motion.div
            key="assessing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-2"
          >
            <LoadingSpinner size="md" />
            <span className="text-sm text-text-secondary">
              Analyzing pronunciation…
            </span>
          </motion.div>
        )}

        {/* Result state */}
        {state === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Overall score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScoreDot score={result.overallScores.accuracy} />
                <span className="text-sm font-medium text-text-primary">
                  Accuracy:{" "}
                  <span className={getScoreLevel(result.overallScores.accuracy).textColor}>
                    {Math.round(result.overallScores.accuracy)}
                  </span>
                </span>
              </div>
              <button
                onClick={handleTryAgain}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5",
                  "text-xs font-medium text-text-secondary",
                  "border border-border transition-colors",
                  "hover:border-text-muted hover:text-text-primary",
                )}
              >
                <RotateCcw className="h-3 w-3" />
                Try Again
              </button>
            </div>

            {/* Per-phoneme mini scores */}
            {result.words[0]?.phonemes && result.words[0].phonemes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.words[0].phonemes.map((p, i) => {
                  const level = getScoreLevel(p.accuracyScore);
                  return (
                    <motion.span
                      key={`${p.phoneme}-${i}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-1",
                        "border border-border font-mono text-xs",
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="text-text-primary">/{p.phoneme}/</span>
                      <span className={cn("text-[10px]", level.textColor)}>
                        {Math.round(p.accuracyScore)}
                      </span>
                    </motion.span>
                  );
                })}
              </div>
            )}

            {audioUrl && (
              <WordAttemptPlayback url={audioUrl} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-accent-red"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function ScoreDot({ score }: { score: number }) {
  const level = getScoreLevel(score);
  return (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: level.color }}
    />
  );
}

function WordAttemptPlayback({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex justify-start">
      <button
        type="button"
        onClick={() => {
          const audio = new Audio(url);
          audio.addEventListener("ended", () => setIsPlaying(false), { once: true });
          audio.addEventListener("error", () => setIsPlaying(false), { once: true });
          setIsPlaying(true);
          void audio.play().catch(() => setIsPlaying(false));
        }}
        className={cn(
          "rounded-md border border-border px-3 py-1.5 text-xs font-medium",
          "text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary",
        )}
      >
        {isPlaying ? "Playing your attempt…" : "Hear my attempt"}
      </button>
    </div>
  );
}
