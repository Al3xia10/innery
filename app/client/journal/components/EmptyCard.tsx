"use client";

import React from "react";

export default function EmptyCard({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[28px] border border-black/5 p-6 sm:p-7 shadow-[0_10px_30px_rgba(31,23,32,0.06)]"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
      }}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">{subtitle}</p>
      <div className="mt-5 flex items-center gap-3">{cta}</div>
    </div>
  );
}