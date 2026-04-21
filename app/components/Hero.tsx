"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden bg-white">


      <div className="z-10 relative mx-auto max-w-7xl px-4 md:px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* LEFT – TEXT */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 px-4">
          <h1 className="text-gray-900 text-4xl md:text-4xl font-semibold leading-tight">
            Terapie organizata <br />
            pentru terapeuti si clienti
          </h1>

          <p className="text-gray-700 text-base md:text-lg max-w-xl">
            Innery este un spatiu privat in care terapeutii pastreaza notite structurate despre clienti,
            iar clientii reflecteaza intre sedinte. Totul ramane organizat, sigur,
            si usor de revizitat — inainte, in timpul si dupa terapie.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              href="/auth/login?role=therapist"
              className="rounded-xl bg-(--color-accent) px-6 py-3 text-[0.95rem] font-medium text-white shadow-sm transition hover:opacity-95"
              role="button"
            >
              Pentru terapeuti
            </Link>

            <Link
              href="/auth/login?role=client"
              className="rounded-xl border border-(--color-soft) bg-white px-6 py-3 text-[0.95rem] font-medium text-gray-900 shadow-sm transition hover:bg-(--color-card)"
              role="button"
            >
              Pentru clienti
            </Link>
          </div>
        </div>

        {/* RIGHT – IMAGE */}
                <div className="w-full md:w-1/2 flex justify-center md:mt-2 relative">
          <div className="relative flex justify-center items-center">

            <div className="absolute -z-10 w-[90%] h-[90%] bg-(--color-soft)/60 rounded-[45%] blur-3xl" />

            <Image
              src="/hero.png"
              alt="Ilustratie care reprezinta terapia online si reflectia"
              width={520}
              height={520}
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}