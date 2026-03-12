"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, Play, Pause, Check } from "lucide-react";
import { useAudioRecorder } from "~/hooks/use-audio-recorder";
import { LoadingSpinner } from "~/components/shared/loading-spinner";
import { cn } from "~/lib/utils";
import { formatDuration } from "~/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isDisabled?: boolean;
}

type RecorderState = "idle" | "recording" | "complete";

export function AudioRecorder({
  onRecordingComplete,
  isDisabled,
}: AudioRecorderProps) {
  const {
    isStarting,
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error,
    analyserNode,
  } = useAudioRecorder();

  const state: RecorderState | "starting" = isStarting
    ? "starting"
    : isRecording
      ? "recording"
      : audioBlob
        ? "complete"
        : "idle";
  const isButtonDisabled = (isDisabled ?? false) || state === "starting";

  const handleToggleRecording = useCallback(async () => {
    if (isDisabled || isStarting) return;
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isDisabled, isRecording, isStarting, startRecording, stopRecording]);

  const handleRecordAgain = useCallback(() => {
    resetRecording();
  }, [resetRecording]);

  const handleSubmit = useCallback(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Duration timer */}
      <AnimatePresence mode="wait">
        {state === "recording" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="font-mono text-2xl font-semibold tabular-nums text-text-primary"
          >
            {formatDuration(duration)}
          </motion.div>
        )}
        {state === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 text-sm font-medium text-accent-green"
          >
            <Check className="h-4 w-4" />
            Recording complete
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waveform */}
      <AnimatePresence>
        {state === "recording" && analyserNode && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
          >
            <Waveform analyserNode={analyserNode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        type="button"
        onClick={state === "complete" ? handleSubmit : handleToggleRecording}
        disabled={isButtonDisabled}
        whileTap={{ scale: 0.92 }}
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "h-20 w-20 md:h-24 md:w-24",
          "transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-accent-blue focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background",
          isButtonDisabled && "pointer-events-none opacity-40",
          state === "idle" && "bg-accent-red hover:bg-accent-red/90",
          state === "starting" && "bg-accent-red/80",
          state === "recording" && "bg-accent-red",
          state === "complete" && "bg-accent-green hover:bg-accent-green/90",
        )}
      >
        {/* Pulsing ring when recording */}
        {state === "recording" && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-accent-red"
              animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-accent-red"
              animate={{ scale: [1, 1.2], opacity: [0.4, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3,
              }}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {state === "idle" && <Mic className="h-8 w-8 text-white md:h-10 md:w-10" />}
            {state === "starting" && <LoadingSpinner size="md" className="text-white" />}
            {state === "recording" && (
              <Square className="h-7 w-7 text-white md:h-8 md:w-8" fill="white" />
            )}
            {state === "complete" && (
              <Check className="h-8 w-8 text-white md:h-10 md:w-10" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Helper text / secondary actions */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.p
            key="idle-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-text-muted"
          >
            Tap to record
          </motion.p>
        )}
        {state === "starting" && (
          <motion.p
            key="starting-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-text-muted"
          >
            Starting microphone…
          </motion.p>
        )}
        {state === "recording" && (
          <motion.p
            key="recording-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-text-muted"
          >
            Tap to stop
          </motion.p>
        )}
        {state === "complete" && (
          <motion.div
            key="complete-actions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex flex-col items-center gap-3"
          >
            {audioUrl && <AudioPlayback url={audioUrl} />}
            <p className="max-w-xs text-center text-xs leading-relaxed text-text-muted">
              Play it back before submitting. If it sounds quiet or empty, record
              again closer to your mic.
            </p>
            <button
              type="button"
              onClick={handleRecordAgain}
              className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Record again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-sm text-accent-red">{error}</p>
      )}
    </div>
  );
}

function Waveform({ analyserNode }: { analyserNode: AnalyserNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 32;
    const barGap = 3;
    const barWidth = (canvas.width - (barCount - 1) * barGap) / barCount;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = (dataArray[dataIndex] ?? 0) / 255;
        const barHeight = Math.max(4, value * centerY * 0.9);

        const x = i * (barWidth + barGap);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + value * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [analyserNode]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={64}
      className="h-12 w-48 md:h-16 md:w-64"
    />
  );
}

function AudioPlayback({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={url} preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        {isPlaying ? "Stop" : "Play back"}
      </button>
    </>
  );
}
