"use client";

import React from "react";

const faqs = [
  {
    q: "Clientii vad notitele terapeutului?",
    a: "Nu, nu implicit. Notitele de sedinta sunt private pentru terapeut. Clientii pot trimite reflectii daca optiunea este activata.",
  },
  {
    q: "Cum adaug un client?",
    a: "In dashboard-ul terapeutului creezi profilul clientului. Ulterior, invitatiile/codurile din backend pot conecta automat accesul clientului.",
  },
  {
    q: "Vad pagini „not found” — de ce?",
    a: "In faza de mock, rutele depind de ID-uri (ex: /therapist/t1). Daca ID-ul nu exista in datele mock, pagina nu se afiseaza.",
  },
  {
    q: "Pot exporta notitele sau reflectiile?",
    a: "Este o nevoie comuna. Incepe cu exporturi/backup-uri de baza cand adaugi backend-ul, apoi extinzi in functie de ce cer terapeutii.",
  },
  {
    q: "Unde raportez un bug?",
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
              Intrebari frecvente
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
              Raspunsuri rapide la intrebarile pe care le primim cel mai des.
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
              Tip: pastreaza Suportul simplu acum — extinde cand onboarding-ul/invitarile si backend-ul sunt live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}