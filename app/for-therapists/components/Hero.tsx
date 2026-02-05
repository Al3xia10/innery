"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F8FC]">
      {/* soft background */}

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-22 mt-4">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-14">
          {/* LEFT */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-600/15 bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
              For therapists
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-gray-900 md:text-4xl">
              A calm workspace for
              <span className="text-indigo-700"> clients</span>,
              <span className="text-indigo-700"> notes</span>, and continuity.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg">
              Keep client context, session notes, and between-session reflections in
              one place — without turning therapy into admin.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth/signup"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create therapist account
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                See how it works
                <span className="ml-2 text-gray-400">→</span>
              </Link>
            </div>
          </div>

          {/* RIGHT – real product preview */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-4xl bg-linear-to-br from-indigo-600/10 via-transparent to-[#FAD2C8]/40" />

            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl">
              <Image
                src="/poza-dashboard-terapeuti.png"
                alt="Innery therapist dashboard preview"
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Real product preview — interface may evolve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}