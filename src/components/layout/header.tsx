"use client";

import { AudioLines } from "lucide-react";
import { UserMenu } from "./user-menu";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function Header({ user }: { user: User }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
      <div className="flex items-center gap-2.5">
        <AudioLines className="h-5 w-5 text-accent-green" />
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          Speechless
        </span>
      </div>

      <UserMenu user={user} />
    </header>
  );
}
