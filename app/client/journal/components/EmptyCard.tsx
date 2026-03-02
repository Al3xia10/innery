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
      className="rounded-3xl border border-dashed border-black/10 p-6 sm:p-7 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      <div className="mt-4">{cta}</div>
    </div>
  );
}