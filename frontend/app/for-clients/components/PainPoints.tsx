"use client";

export default function PainPoints() {
  const less = [
    {
      title: "Gandurile se pierd",
      text: "Momentele importante ajung in notite, mesaje sau se pierd.",
    },
    {
      title: "Uiti ce a contat",
      text: "Iti amintesti emotia, dar nu detaliile cand incepe sedinta.",
    },
    {
      title: "Fara un sentiment clar de progres",
      text: "E greu sa observi tipare cand totul e imprastiat in timp.",
    },
  ];

  const more = [
    {
      title: "Un spatiu privat",
      text: "Un loc calm pentru reflectii — organizat, cautabil, mereu acolo.",
    },
    {
      title: "Continuitate clara",
      text: "Intri in sedinte cu context in cateva secunde, fara stres.",
    },
    {
      title: "Progres vizibil",
      text: "Observi tipare, urmaresti schimbari si construiesti claritate in saptamani si luni.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-18 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
            Mai putin haos mental. Mai multa claritate intre sedinte.
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery te ajuta sa-ti pastrezi reflectiile intr-un singur loc — astfel terapia se simte
            mai continua, chiar si in afara sedintei.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* LESS */}
          <div className="rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
                Mai putin din asta
              </h3>
              <span className="hidden sm:inline-flex rounded-full bg-(--color-card) px-3 py-1 text-xs border border-(--color-soft) text-gray-600">
                frictiune
              </span>
            </div>

            <ul className="mt-5 space-y-4">
              {less.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-white">
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
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* MORE */}
          <div className="rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
                Mai mult din asta
              </h3>
              <span className="hidden sm:inline-flex rounded-full bg-(--color-card) px-3 py-1 text-xs border border-(--color-soft) text-gray-600">
                clarity
              </span>
            </div>

            <ul className="mt-5 space-y-4">
              {more.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-(--color-accent) border border-(--color-accent)">
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

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}