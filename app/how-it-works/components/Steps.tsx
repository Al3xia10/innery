import Link from "next/link";

const therapistSteps = [
  {
    title: "Creeaza-ti spatiul",
    text: "Configureaza-ti spatiul de terapeut — unde munca cu clientii ramane organizata si privata.",
  },
  {
    title: "Adauga profilul unui client",
    text: "Creeaza un profil si pastreaza o cronologie clara pentru notite si context la fiecare client.",
  },
  {
    title: "Scrie notite de sedinta",
    text: "Noteaza ce conteaza dupa sedinte folosind o structura simpla care sustine continuitatea.",
  },
  {
    title: "Revizuieste reflectiile (optional)",
    text: "Daca este activat, clientii pot trimite reflectii scurte intre sedinte pentru revizuire.",
  },
] as const;

const clientSteps = [
  {
    title: "Intra in spatiul tau de client",
    text: "Acceseaza spatiul tau personal conectat la terapeut — calm, simplu si privat.",
  },
  {
    title: "Adauga reflectii",
    text: "Scrie reflectii scurte intre sedinte, ca sa nu pierzi ce a fost important.",
  },
  {
    title: "Urmareste-ti progresul",
    text: "Vezi istoricul reflectiilor in timp — tiparele devin mai usor de observat.",
  },
  {
    title: "Fii pregatit(a)",
    text: "Foloseste notitele pentru claritate in urmatoarea sedinta si focus pe ce conteaza.",
  },
] as const;

function StepList({
  items,
  tone,
}: {
  items: readonly { title: string; text: string }[];
  tone: "indigo" | "slate";
}) {
  const badge =
    tone === "indigo"
      ? "bg-(--color-accent) text-white"
      : "bg-white text-(--color-accent) border border-(--color-accent)";

  return (
    <ol className="mt-6 space-y-5">
      {items.map((s, idx) => (
        <li key={s.title} className="flex gap-4">
          <div className="shrink-0">
            <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${badge}`}>
              {idx + 1}
            </div>
          </div>

          <div className="pt-0.5">
            <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Steps() {
  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
            Intelege fluxul — pentru terapeuti si clienti
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery conecteaza spatiul terapeutului cu spatiul clientului — astfel notitele, reflectiile si
            continuitatea sunt mai simple de gestionat de ambele parti.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Therapists */}
          <div className="rounded-2xl border border-(--color-soft) bg-white p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
                  Pentru terapeuti
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  Un spatiu privat pentru continuitatea cu clientii.
                </p>
              </div>
              <span className="hidden sm:inline-flex whitespace-nowrap rounded-full bg-(--color-card) px-3 py-1 text-xs border border-(--color-soft) text-gray-600">
                Notite • Cronologie • Context
              </span>
            </div>

            <StepList items={therapistSteps} tone="indigo" />

            <div className="mt-10">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-(--color-card)"
              >
                Creeaza cont de terapeut
                
              </Link>
            </div>
          </div>

          {/* Clients */}
          <div className="rounded-2xl border border-(--color-soft) bg-white p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
                  Pentru clienti
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  Un loc calm pentru reflectie intre sedinte.
                </p>
              </div>
              <span className="hidden sm:inline-flex rounded-full bg-(--color-card) px-3 py-1 text-xs border border-(--color-soft) text-gray-600">
                Reflectii • Istoric • Claritate
              </span>
            </div>

            <StepList items={clientSteps} tone="slate" />

            <div className="mt-10">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Creeaza cont de client
              </Link>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
}