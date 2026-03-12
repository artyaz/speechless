/**
 * Privacy utilities for Speechless.
 *
 * Core privacy principles:
 * 1. Audio recordings are processed CLIENT-SIDE ONLY via Azure Speech SDK
 * 2. No audio data is ever sent to or stored on our servers
 * 3. Only text-based assessment results (scores, phonemes, text) are saved
 * 4. Audio blobs are cleared from memory after assessment
 * 5. Each user can only access their own practice sessions (enforced by userId filter)
 */

/**
 * Strips any potentially sensitive binary/audio data from an assessment result
 * before storing it in the database. Only text-based score data is retained.
 */
export function sanitizeAssessmentResult(
  result: unknown,
): Record<string, unknown> | unknown[] | null {
  if (!result || typeof result !== "object") return null;

  const sanitized = JSON.parse(JSON.stringify(result)) as
    | Record<string, unknown>
    | unknown[];

  // Remove any fields that might contain audio/binary data
  const dangerousKeys = [
    "audiocontent",
    "audio",
    "audiodata",
    "blob",
    "binarydata",
    "rawaudio",
  ];

  function stripKeys(obj: Record<string, unknown> | unknown[]): void {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          stripKeys(item as Record<string, unknown> | unknown[]);
        }
      }
      return;
    }

    for (const key of Object.keys(obj)) {
      if (dangerousKeys.includes(key.toLowerCase())) {
        delete obj[key];
        continue;
      }
      // Strip any base64-encoded data (>1KB strings that look like base64)
      const val = obj[key];
      if (typeof val === "string" && val.length > 1024) {
        const str = val;
        if (/^[A-Za-z0-9+/=]+$/.test(str)) {
          delete obj[key];
          continue;
        }
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        stripKeys(obj[key] as Record<string, unknown> | unknown[]);
      }
    }
  }

  stripKeys(sanitized);
  return sanitized;
}
