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
    <div className="rounded-[28px] border border-dashed border-white/70 bg-white/60 backdrop-blur-xl p-6 sm:p-7 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      <div className="mt-4">{cta}</div>
    </div>
  );
}