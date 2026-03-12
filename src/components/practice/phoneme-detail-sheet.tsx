"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Drawer } from "vaul";
import { cn } from "~/lib/utils";
import { getScoreLevel } from "~/lib/scoring";
import { synthesizeWordDemo } from "~/lib/azure-speech";
import { clipAudioBlob } from "~/lib/audio-clips";
import { useIsMobile } from "~/hooks/use-media-query";
import { api } from "~/trpc/react";
import { ArticulationCoach } from "~/components/practice/articulation-coach";
import { PhonemeBreakdown } from "~/components/practice/phoneme-breakdown";
import { PronunciationTips } from "~/components/practice/pronunciation-tips";
import { WordPracticeRecorder } from "~/components/practice/word-practice-recorder";
import type { WordAssessment } from "~/types/assessment";

interface PhonemeDetailSheetProps {
  word: WordAssessment | null;
  sourceAudioBlob: Blob | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PhonemeDetailSheet({
  word,
  sourceAudioBlob,
  isOpen,
  onClose,
}: PhonemeDetailSheetProps) {
  const isMobile = useIsMobile();

  if (!word) return null;

  if (isMobile) {
    return (
      <MobileDrawer
        word={word}
        sourceAudioBlob={sourceAudioBlob}
        isOpen={isOpen}
        onClose={onClose}
      />
    );
  }

  return (
    <DesktopDialog
      word={word}
      sourceAudioBlob={sourceAudioBlob}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

/* ─── Mobile Drawer (vaul) ─────────────────────────────────── */

function MobileDrawer({
  word,
  sourceAudioBlob,
  isOpen,
  onClose,
}: {
  word: WordAssessment;
  sourceAudioBlob: Blob | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col",
            "rounded-t-2xl bg-elevated outline-none",
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center",
              "rounded-md border border-border bg-surface/90 text-text-muted backdrop-blur transition-colors",
              "hover:bg-surface hover:text-text-primary",
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          <Drawer.Title className="sr-only">
            Phoneme detail for &ldquo;{word.word}&rdquo;
          </Drawer.Title>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
          >
            <SheetContent
              word={word}
              sourceAudioBlob={sourceAudioBlob}
              scrollContainerRef={scrollContainerRef}
              onClose={onClose}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ─── Desktop Dialog ───────────────────────────────────────── */

function DesktopDialog({
  word,
  sourceAudioBlob,
  isOpen,
  onClose,
}: {
  word: WordAssessment;
  sourceAudioBlob: Blob | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Phoneme detail for "${word.word}"`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className={cn(
              "fixed left-1/2 top-[4dvh] z-50 flex max-h-[92dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden",
              "rounded-2xl border border-border bg-elevated shadow-2xl",
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center",
                "rounded-md border border-border bg-surface/90 text-text-muted backdrop-blur transition-colors",
                "hover:bg-surface hover:text-text-primary",
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-6"
            >
              <SheetContent
                word={word}
                sourceAudioBlob={sourceAudioBlob}
                scrollContainerRef={scrollContainerRef}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Shared Content ───────────────────────────────────────── */

function SheetContent({
  word,
  sourceAudioBlob,
  scrollContainerRef,
  onClose: _onClose,
}: {
  word: WordAssessment;
  sourceAudioBlob: Blob | null;
  scrollContainerRef: { current: HTMLDivElement | null };
  onClose: () => void;
}) {
  const level = getScoreLevel(word.accuracyScore);
  const { data: tokenData } = api.speech.getToken.useQuery(undefined, {
    staleTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPreparingModelAudio, setIsPreparingModelAudio] = useState(false);
  const [isPreparingUserAudio, setIsPreparingUserAudio] = useState(false);
  const [isPlayingModelAudio, setIsPlayingModelAudio] = useState(false);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [modelPlaybackError, setModelPlaybackError] = useState<string | null>(null);
  const [userPlaybackError, setUserPlaybackError] = useState<string | null>(null);
  const modelAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const cachedModelDemoRef = useRef<{
    word: string;
    audioUrl: string;
  } | null>(null);
  const cachedUserClipRef = useRef<{
    key: string;
    sourceAudioBlob: Blob;
    audioUrl: string;
  } | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    let frameId = 0;
    const updateCollapsedState = () => {
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      const scrollTop = Math.max(0, container.scrollTop);

      setIsCollapsed((wasCollapsed) => {
        if (maxScroll < 56) {
          return false;
        }
        if (!wasCollapsed && scrollTop >= 64) {
          return true;
        }
        if (wasCollapsed && scrollTop <= 18) {
          return false;
        }
        return wasCollapsed;
      });
    };

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateCollapsedState);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCollapsedState();
    });
    resizeObserver.observe(container);

    updateCollapsedState();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef, word.word]);

  const releaseModelDemo = useCallback(() => {
    const audio = modelAudioRef.current;
    if (!audio) {
      setIsPlayingModelAudio(false);
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    if (cachedModelDemoRef.current?.audioUrl) {
      URL.revokeObjectURL(cachedModelDemoRef.current.audioUrl);
      cachedModelDemoRef.current = null;
    }

    setIsPlayingModelAudio(false);
  }, []);

  const releaseUserClip = useCallback(() => {
    const audio = userAudioRef.current;
    if (!audio) {
      setIsPlayingUserAudio(false);
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    if (cachedUserClipRef.current?.audioUrl) {
      URL.revokeObjectURL(cachedUserClipRef.current.audioUrl);
      cachedUserClipRef.current = null;
    }

    setIsPlayingUserAudio(false);
  }, []);

  useEffect(() => {
    const audio = modelAudioRef.current;
    if (!audio) {
      return;
    }

    const handlePlay = () => {
      setIsPlayingModelAudio(true);
      setModelPlaybackError(null);
    };

    const handlePause = () => {
      setIsPlayingModelAudio(false);
    };
    const handleEnded = () => {
      setIsPlayingModelAudio(false);
    };
    const handleError = () => {
      setIsPlayingModelAudio(false);
      setModelPlaybackError("Couldn't play the model audio. Please try again.");
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    const audio = userAudioRef.current;
    if (!audio) {
      return;
    }

    const handlePlay = () => {
      setIsPlayingUserAudio(true);
      setUserPlaybackError(null);
    };
    const handlePause = () => setIsPlayingUserAudio(false);
    const handleEnded = () => setIsPlayingUserAudio(false);
    const handleError = () => {
      setIsPlayingUserAudio(false);
      setUserPlaybackError("Couldn't play your word clip. Please try again.");
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    releaseModelDemo();
    releaseUserClip();
    setIsPreparingModelAudio(false);
    setIsPreparingUserAudio(false);
    setModelPlaybackError(null);
    setUserPlaybackError(null);
  }, [releaseModelDemo, releaseUserClip, word.word]);

  useEffect(() => {
    return () => {
      releaseModelDemo();
      releaseUserClip();
    };
  }, [releaseModelDemo, releaseUserClip]);

  const ensureModelDemo = useCallback(async () => {
    if (cachedModelDemoRef.current?.word === word.word) {
      return cachedModelDemoRef.current;
    }

    if (!tokenData) {
      throw new Error("Model audio is still preparing. Please try again.");
    }

    setIsPreparingModelAudio(true);

    try {
      const demo = await synthesizeWordDemo(word.word, tokenData.token, tokenData.region);
      const audioUrl = URL.createObjectURL(demo.audioBlob);

      if (cachedModelDemoRef.current?.audioUrl) {
        URL.revokeObjectURL(cachedModelDemoRef.current.audioUrl);
      }

      const cachedDemo = {
        word: word.word,
        audioUrl,
      };

      cachedModelDemoRef.current = cachedDemo;
      return cachedDemo;
    } finally {
      setIsPreparingModelAudio(false);
    }
  }, [tokenData, word.word]);

  const ensureUserClip = useCallback(async () => {
    if (!sourceAudioBlob) {
      throw new Error("Your original sentence recording is not available.");
    }

    if (word.durationMs <= 0) {
      throw new Error("We couldn't isolate this word from your sentence yet.");
    }

    const clipKey = `${word.word}:${word.offsetMs}:${word.durationMs}`;
    if (
      cachedUserClipRef.current?.key === clipKey &&
      cachedUserClipRef.current.sourceAudioBlob === sourceAudioBlob
    ) {
      return cachedUserClipRef.current.audioUrl;
    }

    setIsPreparingUserAudio(true);

    try {
      const clippedAudioBlob = await clipAudioBlob(sourceAudioBlob, {
        startMs: word.offsetMs,
        durationMs: word.durationMs,
        paddingMs: 60,
      });
      const audioUrl = URL.createObjectURL(clippedAudioBlob);

      if (cachedUserClipRef.current?.audioUrl) {
        URL.revokeObjectURL(cachedUserClipRef.current.audioUrl);
      }

      cachedUserClipRef.current = {
        key: clipKey,
        sourceAudioBlob,
        audioUrl,
      };

      return audioUrl;
    } finally {
      setIsPreparingUserAudio(false);
    }
  }, [sourceAudioBlob, word.durationMs, word.offsetMs, word.word]);

  const handlePlayModel = useCallback(async () => {
    setModelPlaybackError(null);

    try {
      const demo = await ensureModelDemo();
      const audio = modelAudioRef.current;
      if (!audio) {
        return;
      }

      userAudioRef.current?.pause();

      if (audio.src !== demo.audioUrl) {
        audio.src = demo.audioUrl;
        audio.load();
      }

      audio.pause();
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't play the model audio. Please try again.";
      setModelPlaybackError(message);
    }
  }, [ensureModelDemo]);

  const handlePlayUser = useCallback(async () => {
    setUserPlaybackError(null);

    try {
      const audioUrl = await ensureUserClip();
      const audio = userAudioRef.current;
      if (!audio) {
        return;
      }

      modelAudioRef.current?.pause();

      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
        audio.load();
      }

      audio.pause();
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't play your word clip. Please try again.";
      setUserPlaybackError(message);
    }
  }, [ensureUserClip]);

  return (
    <div className="space-y-5">
      <audio ref={modelAudioRef} className="hidden" preload="auto" />
      <audio ref={userAudioRef} className="hidden" preload="auto" />

      <ArticulationCoach
        word={word}
        isCollapsed={isCollapsed}
        isPreparingModelAudio={isPreparingModelAudio}
        isPlayingModelAudio={isPlayingModelAudio}
        canPlayModel={Boolean(tokenData)}
        onPlayModel={() => {
          void handlePlayModel();
        }}
        isPreparingUserAudio={isPreparingUserAudio}
        isPlayingUserAudio={isPlayingUserAudio}
        canPlayUser={Boolean(sourceAudioBlob && word.durationMs > 0)}
        onPlayUser={() => {
          void handlePlayUser();
        }}
        modelError={modelPlaybackError}
        userError={userPlaybackError}
      />

      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {word.word}
          </h2>
          {word.errorType !== "none" && (
            <span className="mt-0.5 inline-block text-xs capitalize text-accent-amber">
              {word.errorType.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-lg font-bold",
              level.textColor,
            )}
            style={{ backgroundColor: level.colorDim }}
          >
            {Math.round(word.accuracyScore)}
          </span>
          <span className="text-xs text-text-muted">{level.label}</span>
        </div>
      </div>

      <Divider />

      {/* ── Phoneme Breakdown ─────────────────────── */}
      <Section title="Phoneme Breakdown">
        <PhonemeBreakdown phonemes={word.phonemes} />
      </Section>

      <Divider />

      {/* ── Syllable Breakdown ────────────────────── */}
      {word.syllables.length > 0 && (
        <>
          <Section title="Syllables">
            <div className="flex flex-wrap gap-2">
              {word.syllables.map((s, i) => {
                const sLevel = getScoreLevel(s.accuracyScore);
                return (
                  <motion.div
                    key={`${s.syllable}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-border px-3 py-2",
                    )}
                  >
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {s.syllable}
                    </span>
                    <span
                      className={cn("font-mono text-xs font-medium", sLevel.textColor)}
                    >
                      {Math.round(s.accuracyScore)}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: sLevel.color }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </Section>

          <Divider />
        </>
      )}

      {/* ── Pronunciation Tips ────────────────────── */}
      <Section title="How to fix it">
        <PronunciationTips word={word} />
      </Section>

      <Divider />

      {/* ── Practice This Word ────────────────────── */}
      <Section title="Practice This Word">
        <WordPracticeRecorder word={word.word} />
      </Section>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border-subtle" />;
}
