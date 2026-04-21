export default function Features() {
  const features = [
    {
      title: "Un spatiu privat pentru gandurile tale",
      text:
        "Scrie reflectii intre sedinte intr-un spatiu calm, personal — fara presiune sau mesaje constante.",
    },
    {
      title: "Continuitate intre sedinte",
      text:
        "Terapeutul vede ce conteaza pentru tine inainte de fiecare sedinta, asa ca nu pornesti de la zero.",
    },
    {
      title: "Claritate, nu haos",
      text:
        "Tot ce tine de terapia ta este intr-un singur loc — notite, reflectii si context comun.",
    },
    {
      title: "Sigur si respectuos prin design",
      text:
        "Informatiile tale raman private, structurate si partajate doar in relatia terapeutica.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
            Conceput sa-ti sustina terapia
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery te ajuta sa ramai conectat(a) la procesul tau — calm, privat si in ritmul tau.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
              

                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {f.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}