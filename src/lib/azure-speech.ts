// PRIVACY: This module runs entirely in the browser. Audio is sent directly to
// Azure for assessment and is not stored on our servers.
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export interface AssessmentConfig {
  referenceText: string;
  token: string;
  region: string;
}

export interface WordVisemeCue {
  audioOffsetMs: number;
  visemeId: number;
  svgMarkup: string | null;
}

export interface SynthesizedWordDemo {
  audioBlob: Blob;
  visemes: WordVisemeCue[];
}

export async function assessPronunciation(
  audioBlob: Blob,
  config: AssessmentConfig,
): Promise<SpeechSDK.PronunciationAssessmentResult> {
  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
    config.token,
    config.region,
  );
  speechConfig.speechRecognitionLanguage = "en-US";

  const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
    config.referenceText,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    true, // enableMiscue
  );
  pronunciationConfig.nbestPhonemeCount = 5;
  pronunciationConfig.enableProsodyAssessment = true;

  const audioFile = new File([audioBlob], "speechless-recording.wav", {
    type: audioBlob.type || "audio/wav",
  });
  const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);

  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        const pronResult =
          SpeechSDK.PronunciationAssessmentResult.fromResult(result);
        recognizer.close();
        resolve(pronResult);
      },
      (error) => {
        recognizer.close();
        reject(new Error(error));
      },
    );
  });
}

export async function synthesizeWordDemo(
  word: string,
  token: string,
  region: string,
): Promise<SynthesizedWordDemo> {
  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
    token,
    region,
  );
  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
  speechConfig.speechSynthesisOutputFormat =
    SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);
  const visemes: WordVisemeCue[] = [];

  synthesizer.visemeReceived = (_sender, event) => {
    visemes.push({
      audioOffsetMs: event.audioOffset / 10_000,
      visemeId: event.visemeId,
      svgMarkup: event.animation?.trim() ? event.animation : null,
    });
  };

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      buildVisemeSsml(word),
      (result) => {
        synthesizer.close();
        if (!result.audioData || result.audioData.byteLength === 0) {
          reject(new Error("Azure returned empty pronunciation audio."));
          return;
        }

        resolve({
          audioBlob: new Blob([result.audioData], { type: "audio/mpeg" }),
          visemes,
        });
      },
      (error) => {
        synthesizer.close();
        reject(new Error(error));
      },
    );
  });
}

export async function synthesizeWordAudio(
  word: string,
  token: string,
  region: string,
): Promise<Blob> {
  const demo = await synthesizeWordDemo(word, token, region);
  return demo.audioBlob;
}

export async function speakWord(
  word: string,
  token: string,
  region: string,
): Promise<void> {
  const audioBlob = await synthesizeWordAudio(word, token, region);
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  try {
    await audio.play();
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () =>
        reject(new Error("Failed to play synthesized audio."));
    });
  } finally {
    audio.pause();
    audio.src = "";
    URL.revokeObjectURL(audioUrl);
  }
}

function buildVisemeSsml(word: string) {
  const escapedWord = escapeXml(word);

  return `
    <speak version="1.0"
      xmlns="http://www.w3.org/2001/10/synthesis"
      xmlns:mstts="https://www.w3.org/2001/mstts"
      xml:lang="en-US">
      <voice name="en-US-JennyNeural">
        <mstts:viseme type="svg" />
        ${escapedWord}
      </voice>
    </speak>
  `.trim();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
