import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AudioLines } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <AudioLines className="h-6 w-6 text-accent-green" />
          <span className="text-xl font-semibold tracking-tight text-text-primary">
            Speechless
          </span>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
