

"use client";

import React from "react";
import Link from "next/link";

const faqs = [
  {
    q: "Who is Innery for?",
    a: "Innery is built for therapy work: therapists get a private workspace for continuity, and clients get a calm space for optional reflections between sessions.",
  },
  {
    q: "Is Innery private?",
    a: "Innery is designed as a private workspace. Therapists control client profiles and what’s shared. Clients only see what’s meant for them.",
  },
  {
    q: "Can clients see my session notes?",
    a: "By default, no. Session notes are for the therapist. Clients can submit reflections if you enable it, and you decide what you share.",
  },
  {
    q: "Do I have to use it during sessions?",
    a: "No. You can write notes after sessions. Clients can reflect whenever it suits them — Innery supports both workflows.",
  },
  {
    q: "How do clients join?",
    a: "Typically, a therapist invites a client (or shares a code/link). In your current mock phase, this can be represented by IDs; later it’s handled by backend invites.",
  },
  {
    q: "Can I export my data?",
    a: "Yes — export/backups can be supported so you keep your records. You can start with basic exports and expand options as Innery evolves.",
  },
] as const;

export default function FAQ() {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          {/* LEFT – intro */}
          <div className="md:col-span-4">
            <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
              Common questions
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
              Quick answers about how Innery works for therapists and clients.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/for-therapists#pricing"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                See pricing
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Ask a question
              </Link>
            </div>
          </div>

          {/* RIGHT – list */}
          <div className="md:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-[#F7F8FC] p-2">
              <div className="divide-y divide-gray-200 rounded-xl bg-white">
                {faqs.map((item, idx) => {
                  const isOpen = open === idx;
                  return (
                    <div key={item.q} className="p-5">
                      <button
                        type="button"
                        className="w-full flex items-start justify-between gap-4 text-left"
                        onClick={() => setOpen(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm md:text-base font-semibold text-gray-900">
                          {item.q}
                        </span>

                        <span
                          className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                            isOpen
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                          aria-hidden="true"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`h-4 w-4 transition-transform ${
                              isOpen ? "rotate-45" : "rotate-0"
                            }`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 5v14M5 12h14"
                            />
                          </svg>
                        </span>
                      </button>

                      {isOpen && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Tip: Keep this page simple. You can expand the FAQ later when onboarding and invites are live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}