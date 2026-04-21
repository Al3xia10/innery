"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-(--color-card)/40">
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-22 mt-4">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-14">
          {/* LEFT */}
          <div className="max-w-xl">
            

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-gray-900 md:text-4xl">
              Un spatiu calm pentru
              <span className="text-(--color-accent)"> clienti</span>,
              <span className="text-(--color-accent)"> notite</span>, si continuitate.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg">
              Keep client context, session notite, and between-session reflections in
              singur loc — fara sa transformi terapia in administratie.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth/signup"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-(--color-accent) px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Creeaza cont de terapeut
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-(--color-soft) bg-white px-6 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-(--color-card)"
              >
                Vezi cum functioneaza
                <span className="ml-2 text-gray-400">→</span>
              </Link>
            </div>
          </div>

          {/* RIGHT – real product preview */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-4xl bg-linear-to-br from-(--color-accent)/10 via-transparent to-(--color-soft)/30" />

            <div className="overflow-hidden rounded-[28px] border border-(--color-soft) bg-white shadow-lg">
              <Image
                src="/poza-dashboard-terapeuti.png"
                alt="Previzualizare dashboard terapeut Innery"
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Previzualizare reala a produsului — interfata poate evolua.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}