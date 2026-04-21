

"use client";

import React from "react";
import Link from "next/link";

const faqs = [
  {
    q: "Pentru cine este Innery?",
    a: "Innery este construit pentru munca terapeutica: terapeutii primesc un spatiu privat pentru continuitate, iar clientii un loc calm pentru reflectii optionale intre sedinte.",
  },
  {
    q: "Este Innery privat?",
    a: "Innery este conceput ca un spatiu privat. Terapeutii controleaza profilurile clientilor si ce se partajeaza. Clientii vad doar ce este destinat lor.",
  },
  {
    q: "Pot clientii sa-mi vada notitele de sedinta?",
    a: "Implicit, nu. Notitele de sedinta sunt pentru terapeut. Clientii pot trimite reflectii daca activezi optiunea, iar tu decizi ce partajezi.",
  },
  {
    q: "Trebuie sa-l folosesc in timpul sedintelor?",
    a: "Nu. Poti scrie notite dupa sedinte. Clientii pot reflecta cand li se potriveste — Innery sustine ambele fluxuri.",
  },
  {
    q: "Cum se alatura clientii?",
    a: "De obicei, terapeutul invita clientul (sau partajeaza un cod/link). In faza actuala de mock, asta poate fi reprezentat prin ID-uri; ulterior este gestionat prin invitatii din backend.",
  },
  {
    q: "Pot exporta datele?",
    a: "Da — exportul si backup-ul pot fi sustinute ca sa iti pastrezi inregistrarile. Poti incepe cu exporturi de baza si extinzi optiunile pe masura ce Innery evolueaza.",
  },
] as const;

export default function FAQ() {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          {/* LEFT – intro */}
          <div className="md:col-span-4">
            <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
              Intrebari frecvente
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
              Raspunsuri rapide despre cum functioneaza Innery pentru terapeuti si clienti.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/for-therapists#pricing"
                className="inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Vezi preturile
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Pune o intrebare
              </Link>
            </div>
          </div>

          {/* RIGHT – list */}
          <div className="md:col-span-8">
            <div className="rounded-2xl border border-(--color-soft) bg-(--color-card) p-2">
              <div className="divide-y divide-(--color-soft) rounded-xl bg-white">
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
                              ? "border-(--color-soft) bg-(--color-card) text-[#9a5d77]"
                              : "border-(--color-soft) bg-white text-[#9a5d77]"
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
          </div>
        </div>
      </div>
    </section>
  );
}