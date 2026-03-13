"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Settings2, LogOut, Trash2, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import type { DifficultyLevel } from "~/types/practice";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGE_OPTIONS = [
  "Arabic",
  "Chinese (Mandarin)",
  "French",
  "German",
  "Hindi",
  "Italian",
  "Japanese",
  "Korean",
  "Polish",
  "Portuguese",
  "Spanish",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
  "Other",
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [language, setLanguage] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const utils = api.useUtils();
  const preferencesQuery = api.settings.getPreferences.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const updatePreferences = api.settings.updatePreferences.useMutation({
    onMutate: () => {
      setSaveState("saving");
    },
    onSuccess: (preferences) => {
      utils.settings.getPreferences.setData(undefined, preferences);
      setDifficulty(preferences.difficultyLevel);
      setLanguage(preferences.nativeLanguage);
      setSaveState("saved");
    },
    onError: () => {
      setSaveState("error");
    },
  });

  const user = session?.user;
  const controlsDisabled =
    preferencesQuery.isLoading || updatePreferences.isPending;
  const languageOptions =
    language && !LANGUAGE_OPTIONS.includes(language)
      ? [language, ...LANGUAGE_OPTIONS]
      : LANGUAGE_OPTIONS;

  useEffect(() => {
    if (!preferencesQuery.data) {
      return;
    }

    setDifficulty(preferencesQuery.data.difficultyLevel);
    setLanguage(preferencesQuery.data.nativeLanguage);
  }, [preferencesQuery.data]);

  useEffect(() => {
    if (saveState !== "saved") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaveState("idle");
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [saveState]);

  const handleDifficultyChange = (nextDifficulty: DifficultyLevel) => {
    setDifficulty(nextDifficulty);
    updatePreferences.mutate({ difficultyLevel: nextDifficulty });
  };

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    updatePreferences.mutate({
      nativeLanguage: nextLanguage.trim() ? nextLanguage : null,
    });
  };

  const preferenceStatus = preferencesQuery.isLoading
    ? "Loading your saved preferences…"
    : saveState === "saving"
      ? "Saving changes…"
      : saveState === "saved"
        ? "Saved."
        : saveState === "error"
          ? "Couldn't save your changes. Please try again."
          : preferencesQuery.error
            ? "Couldn't load your saved preferences."
            : "Changes save automatically.";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>
      </div>

      <motion.div
        className="flex flex-col gap-5"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Profile */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">
              Profile
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                className="h-14 w-14 rounded-full border border-border"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-elevated">
                <User className="h-6 w-6 text-text-muted" />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-muted">
                Name
              </label>
              <p className="text-sm font-medium text-text-primary">
                {user?.name ?? "—"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-text-muted">
              Email
            </label>
            <p className="mt-0.5 text-sm text-text-secondary">
              {user?.email ?? "—"}
            </p>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">
              Preferences
            </h2>
          </div>

          <p
            aria-live="polite"
            className={cn(
              "mb-4 text-xs",
              saveState === "error" || preferencesQuery.error
                ? "text-accent-red"
                : "text-text-muted",
            )}
          >
            {preferenceStatus}
          </p>

          <div className="flex flex-col gap-4">
            {/* Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) =>
                    handleDifficultyChange(e.target.value as DifficultyLevel)
                  }
                  disabled={controlsDisabled}
                  className={cn(
                    "w-full appearance-none rounded-lg border border-border bg-elevated",
                    "px-3 py-2.5 pr-9 text-sm text-text-primary",
                    "focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background",
                    controlsDisabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">
                Native Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={controlsDisabled}
                  className={cn(
                    "w-full appearance-none rounded-lg border border-border bg-elevated",
                    "px-3 py-2.5 pr-9 text-sm text-text-primary",
                    "focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background",
                    controlsDisabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <option value="">Select language</option>
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <LogOut className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">
              Account
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg",
                "border border-border bg-elevated px-4 py-2.5",
                "text-sm font-medium text-text-secondary transition-colors",
                "hover:bg-surface hover:text-text-primary",
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>

            <div className="mt-2 rounded-lg border border-accent-red/20 bg-accent-red/5 p-4">
              <h3 className="text-sm font-semibold text-accent-red">
                Danger Zone
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                Permanently delete your account and all associated data.
              </p>
              <button
                type="button"
                disabled
                className={cn(
                  "mt-3 flex items-center gap-2 rounded-lg",
                  "border border-accent-red/30 px-3 py-2",
                  "text-xs font-medium text-accent-red",
                  "opacity-50 cursor-not-allowed",
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
