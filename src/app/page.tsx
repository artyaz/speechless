import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AudioLines,
  AudioWaveform,
  Brain,
  Activity,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { auth } from "~/server/auth";

const features = [
  {
    icon: AudioWaveform,
    title: "Phoneme precision",
    description:
      "Get granular feedback on every sound you make, down to individual phonemes.",
  },
  {
    icon: Brain,
    title: "AI-generated texts",
    description:
      "Practice with dynamically generated content tailored to your skill level.",
  },
  {
    icon: Activity,
    title: "Real-time feedback",
    description:
      "See your pronunciation accuracy scored instantly as you speak.",
  },
  {
    icon: TrendingUp,
    title: "Track progress",
    description:
      "Monitor your improvement over time with detailed session history.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Nav */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <AudioLines className="h-5 w-5 text-accent-green" />
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            Speechless
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-secondary">
            <AudioLines className="h-3.5 w-3.5 text-accent-green" />
            AI-powered pronunciation practice
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Perfect your
            <br />
            <span className="text-accent-green">pronunciation</span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
            Practice speaking with real-time AI feedback. Get detailed
            phoneme-level analysis and track your progress over time.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-green px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-6 text-sm font-medium text-text-primary transition-colors hover:bg-elevated"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-elevated">
                <Icon className="h-[18px] w-[18px] text-text-secondary" />
              </div>
              <h3 className="text-sm font-medium text-text-primary">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-text-muted sm:px-6">
        Speechless — Practice perfect pronunciation
      </footer>
    </div>
  );
}
