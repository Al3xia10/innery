"use client";
import Link from "next/link";

export default function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-[#FAD2C8]">
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      className="absolute -top-1 left-0 w-full h-36"
    >
    <path
      d="
        M0,80
        C200,20 400,20 600,60
        C800,100 1000,120 1200,60
        L1200,0
        L0,0
        Z
      "
      fill="#FFFFFF"
    />
  </svg>

      <div className="relative z-20 mx-auto max-w-5xl px-6 py-24 mt-6">

        {/* TITLE */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Why Innery? <br /> Built for therapist–client work
          </h2>
          <p className="mt-4 text-gray-700 text-base leading-relaxed max-w-xl mx-auto">
            Innery supports the ongoing work of therapy — notes, reflections, and follow‑ups
            that bring clarity before, during, and between sessions.
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* LEFT – LIST */}
          <ul className="space-y-12">
            {[
              {
                title: "One shared workspace",
                text:
                  "A private place where therapists document care and clients reflect — aligned around the same therapeutic process.",
              },
              {
                title: "Between‑session progress",
                text:
                  "Prompts, reflections, and follow‑ups help clients stay engaged, and help therapists pick up exactly where you left off.",
              },
              {
                title: "Designed for real practice",
                text:
                  "Clear structure for ethical documentation, continuity, and collaboration — without turning therapy into “on‑demand chat.”",
              },
            ].map((item, index) => (
              <li key={index} className="flex gap-6">
                <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </span>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed max-w-md">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* RIGHT – FLOATING CARD */}
          <div className="relative md:mt-16 z-20">
            <div className="bg-white rounded-xl shadow-lg p-10 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4 leading-snug">
                Built with therapists
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Shaped by clinical experience — designed to support ethical documentation,
                continuity of care, and a strong therapeutic alliance.
              </p>

              <Link
                href="/about"
                className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-md text-sm transition"
              >
                About the approach
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}