"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden">


      <div className="z-10 relative mx-auto max-w-7xl px-4 md:px-8 py-20 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* LEFT – TEXT */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 px-4">
          <h1 className="text-gray-900 text-4xl md:text-4xl font-semibold leading-tight">
            Therapy, organized <br />
            for therapists and clients
          </h1>

          <p className="text-gray-700 text-base md:text-lg max-w-xl">
            Innery is a private workspace where therapists keep structured client notes,
            and clients reflect between sessions. Everything stays organized, secure,
            and easy to revisit — before, during, and after therapy.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              href="/auth/login?role=therapist"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-md text-sm md:text-base transition"
              role="button"
            >
              For therapists
            </Link>

            <Link
              href="/auth/login?role=client"
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 px-6 py-3 rounded-md text-sm md:text-base transition"
              role="button"
            >
              For clients
            </Link>
          </div>
        </div>

        {/* RIGHT – IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center md:mt-10">
          <Image
            src="/hero.png"
            alt="Illustration representing online therapy and reflection"
            width={520}
            height={520}
            className="object-contain"
            priority
          />
        </div>

      </div>
    </section>
  );
}