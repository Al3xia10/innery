"use client";

import React from "react";
import Link from "next/link";

export default function PricingTeaser() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");

  const isAnual = billing === "yearly";

  const yearlyLunarEquivalent: Record<string, string> = {
    Professional: "≈ €15.17 / luna",
    Clinic: "≈ €55.17 / luna",
  };

  const plans = [
    {
      name: "Starter",
      note: "Pentru explorare initiala",
      price: { monthly: "Gratuit", yearly: "Gratuit" },
      features: [
        "Pana la 3 clienti",
        "Notite de sedinta",
        "Reflectii clienti",
        "Vedere generala de baza",
      ],
      cta: { label: "Incepe gratuit", href: "/auth/signup" },
      highlight: false,
    },
    {
      name: "Professional",
      note: "Pentru practici active",
      price: { monthly: "€19 / luna", yearly: "€182 / an" },
      features: [
        "Clienti nelimitati",
        "Sabloane structurate de notite",
        "Obiective si urmarire progres",
        "Exporturi si backup-uri",
      ],
      cta: { label: "Treci la Pro", href: "/auth/signup" },
      highlight: true,
    },
    {
      name: "Clinic",
      note: "Pentru echipe si clinici",
      price: { monthly: "€69 / luna", yearly: "€662 / an" },
      features: [
        "Conturi multiple de terapeuti",
        "Roluri si permisiuni",
        "Sabloane si standarde comune",
        "Raportare la nivel de echipa",
      ],
      cta: { label: "Treci la Clinic", href: "/auth/signup" },
      highlight: false,
    },
  ] as const;

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
            Preturi simple, construite pentru practica
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Incepi simplu, apoi faci upgrade cand esti pregatit(a). Planurile raman orientate pe ce au nevoie terapeutii.
          </p>

          <div className="mt-8 flex justify-center md:justify-start">
            <div className="w-full max-w-100">
              <div
                className="relative grid grid-cols-2 rounded-2xl border border-(--color-soft) bg-white p-1 shadow-sm"
                role="group"
                aria-label="Perioada de facturare"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-(--color-accent) shadow-sm transition-transform duration-200 ease-out ${
                    isAnual ? "translate-x-full" : "translate-x-0"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`relative z-10 inline-flex max-h-9.5 items-center justify-center rounded-xl px-4 py-2 text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/60 ${
                    !isAnual ? "text-white" : "text-gray-700 hover:text-gray-900"
                  }`}
                  aria-pressed={!isAnual}
                >
                  Lunar
                </button>

                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`relative z-10 inline-flex max-h-9.5 items-center justify-center rounded-xl px-4 py-2 text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/60 ${
                    isAnual ? "text-white" : "text-gray-700 hover:text-gray-900"
                  }`}
                  aria-pressed={isAnual}
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="text-lg font-semibold">Anual</span>
                    <span
                      className={` text-[11px] font-semibold whitespace-nowrap ${
                        isAnual ? "text-white/95" : "text-gray-600"
                      }`}
                    >
                      Economisesti 20% 
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`group rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                p.highlight
                  ? "border-(--color-soft) ring-1 ring-(--color-soft) hover:border-(--color-accent)"
                  : "border-(--color-soft) hover:border-(--color-accent)"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{p.note}</p>
                </div>

                {p.highlight && (
                  <span className="hidden sm:inline-flex whitespace-nowrap rounded-full bg-(--color-card) px-3 py-1 text-xs border border-(--color-soft) text-gray-600">
                    Cel mai bun raport pret-valoare
                  </span>
                )}
              </div>

              <div className="mt-6">
                <p className="text-3xl font-semibold text-gray-900">
                  {p.price[billing]}
                </p>

                {p.name !== "Starter" && isAnual && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-500">
                      {yearlyLunarEquivalent[p.name]}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      Facturat anual • Economisesti 20%
                    </p>
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-(--color-accent)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={p.cta.href}
                  className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-(--color-accent) text-white hover:opacity-90"
                      : "border border-(--color-soft) bg-white text-gray-900 hover:bg-(--color-card)"
                  }`}
                >
                  {p.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
