export async function clipAudioBlob(
  audioBlob: Blob,
  options: {
    startMs: number;
    durationMs: number;
    paddingMs?: number;
  },
): Promise<Blob> {
  const audioContext = new AudioContext();

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const sampleRate = audioBuffer.sampleRate;
    const paddingMs = options.paddingMs ?? 60;
    const clipStartMs = Math.max(0, options.startMs - paddingMs);
    const clipEndMs = Math.min(
      audioBuffer.duration * 1000,
      options.startMs + options.durationMs + paddingMs,
    );

    const startSample = Math.max(
      0,
      Math.floor((clipStartMs / 1000) * sampleRate),
    );
    const endSample = Math.min(
      audioBuffer.length,
      Math.ceil((clipEndMs / 1000) * sampleRate),
    );

    const sourceChannel = audioBuffer.getChannelData(0);
    const clippedSamples = sourceChannel.slice(startSample, endSample);
    const wavBuffer = encodeMonoWav(clippedSamples, sampleRate);

    return new Blob([wavBuffer], { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}

function encodeMonoWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
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
