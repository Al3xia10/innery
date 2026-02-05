"use client";

import React from "react";

const faqs = [
  {
    q: "Do clients see therapist notes?",
    a: "No, not by default. Session notes are private to the therapist. Clients can submit reflections if enabled.",
  },
  {
    q: "How do I add a client?",
    a: "In the therapist dashboard, you create a client profile. Later, backend invites/codes can connect client access automatically.",
  },
  {
    q: "I’m seeing “not found” pages — why?",
    a: "In the mock phase, routes rely on IDs (e.g. /therapist/t1). If the ID doesn’t exist in your mock data, the page won’t render.",
  },
  {
    q: "Can I export notes or reflections?",
    a: "That’s a common need. Start with basic export/backups when you add backend, then expand based on what therapists request most.",
  },
  {
    q: "Where do I report a bug?",
    a: "Email support@innery.com with your device, browser, the page URL, and steps to reproduce. Screenshots help a lot.",
  },
] as const;

export default function SupportFAQ() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-4">
            <p className="text-sm font-medium text-indigo-600">FAQ</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
              Common questions
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
              Quick answers to the questions we expect most.
            </p>
          </div>

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
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-45" : "rotate-0"}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
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
              Tip: keep Support simple now — expand when onboarding/invites + backend go live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}