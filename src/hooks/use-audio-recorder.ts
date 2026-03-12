// PRIVACY: Audio recordings stay entirely client-side. No audio data is sent to our server.
// Audio blobs are cleared from memory via resetRecording() and on unmount.
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UseAudioRecorderReturn {
  isStarting: boolean;
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
  analyserNode: AnalyserNode | null;
}

const TARGET_SAMPLE_RATE = 16_000;
const MIN_RECORDING_DURATION_MS = 700;
const MIN_WAV_BYTES = 2_048;
const MIN_SIGNAL_RMS = 0.008;
const MIN_PEAK_AMPLITUDE = 0.03;

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silenceGainRef = useRef<GainNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef(TARGET_SAMPLE_RATE);
  const signalPeakRef = useRef(0);
  const signalSquareSumRef = useRef(0);
  const signalSampleCountRef = useRef(0);
  const isCapturingRef = useRef(false);
  const hasCaptureStartedRef = useRef(false);

  const cleanup = useCallback(() => {
    isCapturingRef.current = false;
    hasCaptureStartedRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    processorRef.current?.disconnect();
    processorRef.current = null;
    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    silenceGainRef.current?.disconnect();
    silenceGainRef.current = null;
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close().catch(() => { /* noop — fire and forget */ });
    }
    audioContextRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAnalyserNode(null);
    setIsStarting(false);
  }, []);

  const clearRecordingData = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    pcmChunksRef.current = [];
    signalPeakRef.current = 0;
    signalSquareSumRef.current = 0;
    signalSampleCountRef.current = 0;
    hasCaptureStartedRef.current = false;
    startTimeRef.current = 0;
  }, [audioUrl]);

  const finalizeRecording = useCallback((recordingDuration: number) => {
    const mergedSamples = mergeFloat32Chunks(pcmChunksRef.current);
    const inputSampleRate = sampleRateRef.current;
    const rms =
      signalSampleCountRef.current > 0
        ? Math.sqrt(signalSquareSumRef.current / signalSampleCountRef.current)
        : 0;

    cleanup();

    if (recordingDuration < MIN_RECORDING_DURATION_MS) {
      setError("Record at least a full word or sentence before stopping.");
      return;
    }

    if (
      mergedSamples.length === 0 ||
      (rms < MIN_SIGNAL_RMS && signalPeakRef.current < MIN_PEAK_AMPLITUDE)
    ) {
      setError(
        "We mostly captured silence. Check mic access, move closer, and speak a little louder.",
      );
      return;
    }

    const downsampledSamples = downsampleFloat32Buffer(
      mergedSamples,
      inputSampleRate,
      TARGET_SAMPLE_RATE,
    );
    const wavBuffer = encodeWav(downsampledSamples, TARGET_SAMPLE_RATE);
    const blob = new Blob([wavBuffer], { type: "audio/wav" });

    if (blob.size < MIN_WAV_BYTES) {
      setError("That recording is too short to analyze. Please try again.");
      return;
    }

    setError(null);
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
  }, [cleanup]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      cleanup();
      clearRecordingData();
      setIsRecording(false);
      setIsPaused(false);
      setIsStarting(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not available in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ latencyHint: "interactive" });
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      sampleRateRef.current = audioContext.sampleRate;

      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      setAnalyserNode(analyser);

      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      processorRef.current = processor;
      const silenceGain = audioContext.createGain();
      silenceGain.gain.value = 0;
      silenceGainRef.current = silenceGain;

      setIsStarting(true);
      isCapturingRef.current = true;

      processor.onaudioprocess = (event) => {
        if (!isCapturingRef.current) {
          return;
        }

        const inputData = event.inputBuffer.getChannelData(0);
        if (inputData.length === 0) {
          return;
        }

        if (!hasCaptureStartedRef.current) {
          hasCaptureStartedRef.current = true;
          startTimeRef.current = Date.now();
          setDuration(0);
          setIsStarting(false);
          setIsRecording(true);
          setIsPaused(false);

          timerRef.current = setInterval(() => {
            setDuration(Date.now() - startTimeRef.current);
          }, 100);
        }

        const chunk = new Float32Array(inputData.length);
        chunk.set(inputData);
        pcmChunksRef.current.push(chunk);

        let localPeak = 0;
        let localSquareSum = 0;
        for (const sample of chunk) {
          const absoluteValue = Math.abs(sample);
          if (absoluteValue > localPeak) {
            localPeak = absoluteValue;
          }
          localSquareSum += sample * sample;
        }

        signalPeakRef.current = Math.max(signalPeakRef.current, localPeak);
        signalSquareSumRef.current += localSquareSum;
        signalSampleCountRef.current += chunk.length;
      };

      source.connect(processor);
      processor.connect(silenceGain);
      silenceGain.connect(audioContext.destination);

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access microphone";
      setError(message);
      setIsStarting(false);
      cleanup();
      return false;
    }
  }, [cleanup, clearRecordingData]);

  const stopRecording = useCallback(() => {
    if (!isRecording && !isStarting) {
      return;
    }

    isCapturingRef.current = false;
    setIsRecording(false);
    setIsStarting(false);
    setIsPaused(false);

    const recordingDuration = startTimeRef.current
      ? Date.now() - startTimeRef.current
      : 0;
    setDuration(recordingDuration);
    finalizeRecording(recordingDuration);
  }, [finalizeRecording, isRecording, isStarting]);

  const resetRecording = useCallback(() => {
    cleanup();
    clearRecordingData();
    setIsStarting(false);
    setIsRecording(false);
    setIsPaused(false);
  }, [cleanup, clearRecordingData]);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, cleanup]);

  return {
    isStarting,
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    error,
    analyserNode,
  };
}

function mergeFloat32Chunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
}

function downsampleFloat32Buffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
): Float32Array {
  if (buffer.length === 0 || inputSampleRate === outputSampleRate) {
    return buffer;
  }

  if (outputSampleRate > inputSampleRate) {
    throw new Error("Output sample rate must not exceed input sample rate.");
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const outputLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(outputLength);

  let outputIndex = 0;
  let inputIndex = 0;

  while (outputIndex < outputLength) {
    const nextInputIndex = Math.min(
      Math.round((outputIndex + 1) * sampleRateRatio),
      buffer.length,
    );

    let sampleSum = 0;
    let sampleCount = 0;

    for (let index = inputIndex; index < nextInputIndex; index += 1) {
      sampleSum += buffer[index] ?? 0;
      sampleCount += 1;
    }

    result[outputIndex] = sampleCount > 0 ? sampleSum / sampleCount : 0;
    outputIndex += 1;
    inputIndex = nextInputIndex;
  }

  return result;
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeAsciiString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAsciiString(view, 8, "WAVE");
  writeAsciiString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAsciiString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  writeInt16Pcm(view, 44, samples);

  return buffer;
}

function writeAsciiString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function writeInt16Pcm(
  view: DataView,
  offset: number,
  input: Float32Array,
) {
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
    view.setInt16(
      offset + index * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }
}
