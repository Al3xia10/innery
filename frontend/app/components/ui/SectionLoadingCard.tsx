"use client";

import * as React from "react";

export default function SectionLoadingCard({
  title = "Se încarcă…",
  description,
  className = "",
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-black/5 bg-white/80 p-4 shadow-[0_6px_14px_rgba(31,23,32,0.05)] sm:rounded-4xl sm:p-5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-(--color-accent)/70" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-(--color-foreground-muted,#6B5A63) sm:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
