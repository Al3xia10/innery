import * as React from "react";

type Variant = "marketing" | "dashboard" | "auth";

export default function RouteSkeleton({ variant = "dashboard" }: { variant?: Variant }) {
  if (variant === "auth") {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10 sm:px-6">
        <div className="w-full animate-pulse rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_24px_rgba(31,23,32,0.08)] sm:p-8">
          <div className="h-7 w-2/3 rounded-xl bg-gray-200/80" />
          <div className="mt-3 h-4 w-5/6 rounded-xl bg-gray-200/60" />
          <div className="mt-7 space-y-3">
            <div className="h-11 w-full rounded-xl bg-gray-200/60" />
            <div className="h-11 w-full rounded-xl bg-gray-200/60" />
          </div>
          <div className="mt-6 h-11 w-full rounded-xl bg-(--color-accent)/50" />
        </div>
      </section>
    );
  }

  if (variant === "marketing") {
    return (
      <section className="mx-auto w-full max-w-6xl animate-pulse space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-black/5 bg-white p-6 shadow-[0_8px_24px_rgba(31,23,32,0.06)] sm:p-10">
          <div className="h-9 w-2/3 rounded-xl bg-gray-200/80" />
          <div className="mt-4 h-4 w-5/6 rounded-xl bg-gray-200/60" />
          <div className="mt-2 h-4 w-2/3 rounded-xl bg-gray-200/60" />
          <div className="mt-8 h-11 w-40 rounded-xl bg-(--color-accent)/50" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_6px_16px_rgba(31,23,32,0.05)]">
              <div className="h-5 w-1/2 rounded-xl bg-gray-200/80" />
              <div className="mt-3 h-4 w-full rounded-xl bg-gray-200/60" />
              <div className="mt-2 h-4 w-5/6 rounded-xl bg-gray-200/60" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-3 py-6 sm:px-6 lg:px-8">
      <div className="rounded-4xl border border-black/5 bg-white p-6 shadow-[0_8px_24px_rgba(31,23,32,0.06)] sm:p-8">
        <div className="h-8 w-1/3 rounded-xl bg-gray-200/80" />
        <div className="mt-3 h-4 w-2/3 rounded-xl bg-gray-200/60" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-2xl bg-gray-200/60" />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12 xl:grid-cols-[1.08fr_1.92fr]">
        <div className="space-y-3 rounded-4xl border border-black/5 bg-white p-4 shadow-[0_8px_20px_rgba(31,23,32,0.05)]">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-black/5 bg-gray-50/90 p-4">
              <div className="h-4 w-1/2 rounded bg-gray-200/80" />
              <div className="mt-2 h-3 w-1/3 rounded bg-gray-200/60" />
            </div>
          ))}
        </div>

        <div className="rounded-4xl border border-black/5 bg-white p-5 shadow-[0_8px_20px_rgba(31,23,32,0.05)]">
          <div className="h-5 w-2/5 rounded bg-gray-200/80" />
          <div className="mt-4 h-36 w-full rounded-2xl bg-gray-200/60" />
          <div className="mt-4 h-36 w-full rounded-2xl bg-gray-200/60" />
        </div>
      </div>
    </section>
  );
}
