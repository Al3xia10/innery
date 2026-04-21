export default function PainPoints() {
  const less = [
    {
      title: "Notite imprastiate",
      text: "Notitele de sedinta, reflectiile si follow-up-urile stau in locuri diferite.",
    },
    {
      title: "Reconstituirea contextului la fiecare sedinta",
      text: "Pierzi primele minute amintindu-ti ce a contat data trecuta.",
    },
    {
      title: "Administratie care iti fura atentia",
      text: "Documentare care adauga incarcare cognitiva in loc sa o reduca.",
    },
  ];

  const more = [
    {
      title: "Un singur spatiu per client",
      text: "Un spatiu privat si organizat pentru fiecare client — mereu la zi.",
    },
    {
      title: "Continuitate clara",
      text: "Incepi sedintele cu context in secunde, nu minute.",
    },
    {
      title: "Un flux mai calm",
      text: "Structura care sustine munca clinica fara sa devina inca un sistem.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-18 md:py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
           Mai putina incarcare. Pastreaza focusul pe terapie.
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Un mod mai calm de a gestiona notite, reflectii si contextul clientului — fara inca un sistem de care sa te ocupi.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* LESS */}
          <div className="rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-(--color-primary)">
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
              <h3 className="text-xs uppercase tracking-wide font-semibold text-(--color-primary)">
                Mai mult din asta
              </h3>
              <span className="hidden sm:inline-flex rounded-full bg-(--color-card) px-3 py-1 text-xs border border-(--color-soft) text-gray-600">
                claritate
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