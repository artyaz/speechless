"use client";

import { api } from "~/trpc/react";

export function LatestPost() {
  const { data: hello } = api.post.hello.useQuery({ text: "from component" });

  return (
    <div className="w-full max-w-xs">
      {hello ? (
        <p className="truncate">{hello.greeting}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
