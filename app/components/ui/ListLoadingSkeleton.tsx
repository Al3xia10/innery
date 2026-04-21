"use client";

import * as React from "react";

export default function ListLoadingSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-[20px] border border-black/5 bg-white/85 p-4 shadow-[0_4px_12px_rgba(31,23,32,0.04)]"
        >
          <div className="h-4 w-1/2 rounded bg-gray-200/80" />
          <div className="mt-2 h-3 w-1/3 rounded bg-gray-200/60" />
          <div className="mt-3 h-3 w-4/5 rounded bg-gray-200/60" />
        </div>
      ))}
    </div>
  );
}
