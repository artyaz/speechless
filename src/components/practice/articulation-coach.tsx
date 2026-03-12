"use client";

import { Sparkles, Volume2, Waves } from "lucide-react";
import { LoadingSpinner } from "~/components/shared/loading-spinner";
import { PHONEME_TIPS } from "~/lib/pronunciation-tips-data";
import { getScoreLevel } from "~/lib/scoring";
import { cn } from "~/lib/utils";
import type { WordAssessment } from "~/types/assessment";

interface ArticulationCoachProps {
  word: WordAssessment;
  isCollapsed: boolean;
  isPreparingModelAudio: boolean;
  isPlayingModelAudio: boolean;
  canPlayModel?: boolean;
  onPlayModel: () => void;
  isPreparingUserAudio?: boolean;
  isPlayingUserAudio?: boolean;
  canPlayUser?: boolean;
  onPlayUser?: () => void;
  modelError?: string | null;
  userError?: string | null;
}

export function ArticulationCoach({
  word,
  isCollapsed,
  isPreparingModelAudio,
  isPlayingModelAudio,
  canPlayModel,
  onPlayModel,
  isPreparingUserAudio,
  isPlayingUserAudio,
  canPlayUser,
  onPlayUser,
  modelError,
  userError,
}: ArticulationCoachProps) {
  const focusPhoneme = [...word.phonemes].sort(
    (left, right) => left.accuracyScore - right.accuracyScore,
  )[0];
  const focusTip = focusPhoneme ? PHONEME_TIPS[focusPhoneme.phoneme] : undefined;
  const focusLevel = focusPhoneme
    ? getScoreLevel(focusPhoneme.accuracyScore)
    : null;
  const activeError = modelError ?? userError;

  return (
    <div
      className={cn(
        "sticky top-0 z-10 rounded-xl border border-border bg-elevated/95 backdrop-blur",
        "transition-[padding,background-color,border-color,box-shadow] duration-200 ease-out",
        isCollapsed ? "p-2.5" : "p-4",
      )}
    >
      <div
        className={cn(
          "gap-3",
          isCollapsed ? "flex items-center justify-between" : "space-y-3",
        )}
      >
        <div className={cn("min-w-0", isCollapsed ? "pr-2" : "space-y-3")}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent-blue" />
            Pronunciation coach
          </div>

          <div className="space-y-3">
            <p
              className={cn(
                "truncate text-xs text-text-muted transition-[opacity,transform,max-height,margin] duration-180 ease-out",
                isCollapsed
                  ? "max-h-6 translate-y-0 opacity-100"
                  : "max-h-0 -translate-y-1 opacity-0",
              )}
              aria-hidden={!isCollapsed}
            >
              {word.word}
            </p>

            <div
              className={cn(
                "overflow-hidden transition-[max-height,opacity,transform,margin] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isCollapsed
                  ? "pointer-events-none mt-0 max-h-0 -translate-y-1 opacity-0"
                  : "mt-0 max-h-[26rem] translate-y-0 opacity-100",
              )}
              aria-hidden={isCollapsed}
            >
              <div className="space-y-3 pb-0.5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-text-primary">
                      Target mouth shape
                    </span>
                    {focusPhoneme && focusLevel && (
                      <span
                        className="rounded-md px-2 py-1 font-mono text-sm font-semibold"
                        style={{
                          color: focusLevel.color,
                          backgroundColor: focusLevel.colorDim,
                        }}
                      >
                        /{focusPhoneme.phoneme}/
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-text-secondary">
                    {focusTip?.description ??
                      "Listen to the model first, then compare it with your own clipped word to hear exactly where the shape changes."}
                  </p>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-surface/80 p-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Mouth position
                    </p>
                    <p className="text-sm leading-relaxed text-text-primary">
                      {focusTip?.mouthPosition ??
                        "Keep your mouth relaxed, shape the sound cleanly, and compare the model audio with your own clip until the opening and release feel the same."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                      What to change
                    </p>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {focusTip?.tip ??
                        "Slow the word down, exaggerate the target sound once or twice, then say the whole word smoothly without adding extra vowels or tension."}
                    </p>
                  </div>

                  {focusTip?.commonMistake && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Common slip
                      </p>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {focusTip.commonMistake}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex gap-2",
            isCollapsed ? "shrink-0" : "flex-wrap",
          )}
        >
          <button
            type="button"
            onClick={onPlayModel}
            disabled={!canPlayModel || isPreparingModelAudio}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary transition-all",
              "hover:border-accent-blue/40 hover:bg-accent-blue-dim/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isPreparingModelAudio ? (
              <LoadingSpinner size="sm" className="text-accent-blue" />
            ) : (
              <Volume2 className="h-4 w-4 text-accent-blue" />
            )}
            {isPreparingModelAudio
              ? "Preparing…"
              : isPlayingModelAudio
                ? "Replay model"
                : isCollapsed
                  ? "Model"
                  : "Hear the model"}
          </button>

          {canPlayUser && onPlayUser && (
            <button
              type="button"
              onClick={onPlayUser}
              disabled={isPreparingUserAudio}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary transition-all",
                "hover:border-accent-green/40 hover:bg-accent-green-dim/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {isPreparingUserAudio ? (
                <LoadingSpinner size="sm" className="text-accent-green" />
              ) : (
                <Waves className="h-4 w-4 text-accent-green" />
              )}
              {isPreparingUserAudio
                ? "Preparing…"
                : isPlayingUserAudio
                  ? "Replay mine"
                  : isCollapsed
                    ? "Mine"
                    : "Hear my pronunciation"}
            </button>
          )}
        </div>
      </div>

      {activeError && (
        <p
          className={cn(
            "text-xs text-accent-red",
            isCollapsed ? "mt-2 text-center" : "mt-3",
          )}
        >
          {activeError}
        </p>
      )}
    </div>
  );
}
