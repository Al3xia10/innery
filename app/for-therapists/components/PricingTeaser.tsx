"use client";

import React from "react";
import Link from "next/link";

export default function PricingTeaser() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");

  const isYearly = billing === "yearly";

  const yearlyMonthlyEquivalent: Record<string, string> = {
    Professional: "≈ €15.17 / month",
    Clinic: "≈ €55.17 / month",
  };

  const plans = [
    {
      name: "Starter",
      note: "For early exploration",
      price: { monthly: "Free", yearly: "Free" },
      features: [
        "Up to 3 clients",
        "Session notes",
        "Client reflections",
        "Basic overview",
      ],
      cta: { label: "Start free", href: "/auth/signup" },
      highlight: false,
    },
    {
      name: "Professional",
      note: "For active practices",
      price: { monthly: "€19 / month", yearly: "€182 / year" },
      features: [
        "Unlimited clients",
        "Structured note templates",
        "Goals & progress tracking",
        "Exports & backups",
      ],
      cta: { label: "Upgrade to Pro", href: "/auth/signup" },
      highlight: true,
    },
    {
      name: "Clinic",
      note: "For teams & clinics",
      price: { monthly: "€69 / month", yearly: "€662 / year" },
      features: [
        "Multiple therapist accounts",
        "Roles & permissions",
        "Shared templates & standards",
        "Team-level reporting",
      ],
      cta: { label: "Upgrade to Clinic", href: "/auth/signup" },
      highlight: false,
    },
  ] as const;

  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
            Simple pricing, built for practice
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Start small, then upgrade when you’re ready. Plans stay focused on what therapists actually need.
          </p>

          <div className="mt-8 flex items-center justify-center md:justify-start">
            <div
              className="relative inline-flex rounded-2xl border border-gray-200 bg-white/80 p-1 shadow-sm backdrop-blur"
              role="group"
              aria-label="Billing period"
            >
              {/* sliding thumb */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-indigo-600 shadow-sm transition-transform duration-200 ease-out ${
                  isYearly ? "translate-x-full" : "translate-x-0"
                }`}
              />

              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`relative z-10 inline-flex min-w-38 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
                  !isYearly
                    ? "text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                aria-pressed={!isYearly}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`relative z-10 inline-flex min-w-38 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
                  isYearly
                    ? "text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                aria-pressed={isYearly}
              >
                Yearly
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                    isYearly
                      ? "bg-white/20 text-white"
                      : "bg-[#FAD2C8] text-gray-900"
                  }`}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`group rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                p.highlight
                  ? "border-indigo-200 ring-1 ring-indigo-200 hover:border-indigo-300"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{p.note}</p>
                </div>

                {p.highlight && (
                  <span className="inline-flex items-center rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Best value
                  </span>
                )}
              </div>

              <div className="mt-6">
                <p className="text-3xl font-semibold text-gray-900">
                  {p.price[billing]}
                </p>

                {p.name !== "Starter" && isYearly && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-500">
                      {yearlyMonthlyEquivalent[p.name]}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      Billed yearly • Save 20%
                    </p>
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-700">
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
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
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