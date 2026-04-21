"use client";
import Link from "next/link";

export default function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-(--color-card)">
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      className="absolute -top-1 left-0 w-full h-36"
    >
    <path
      d="
        M0,80
        C200,20 400,20 600,60
        C800,100 1000,120 1200,60
        L1200,0
        L0,0
        Z
      "
      fill="#ffffff"
    />
  </svg>

      <div className="relative z-20 mx-auto max-w-5xl px-6 py-24 mt-6">

        {/* TITLE */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            De ce Innery? <br /> Creat pentru munca terapeut-client
          </h2>
          <p className="mt-4 text-gray-600 text-base leading-relaxed max-w-xl mx-auto">
            Innery sustine munca terapeutica continua — notite, reflectii si follow-up-uri
            care aduc claritate inainte, in timpul si intre sedinte.
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* LEFT – LIST */}
          <ul className="space-y-12">
            {[
              {
                title: "Un spatiu comun",
                text:
                  "Un loc privat unde terapeutii documenteaza procesul iar clientii reflecteaza — aliniati in acelasi parcurs terapeutic.",
              },
              {
                title: "Progres intre sedinte",
                text:
                  "Prompturile, reflectiile si follow-up-urile ajuta clientii sa ramana implicati, iar terapeutii continua exact de unde au ramas.",
              },
              {
                title: "Conceput pentru practica reala",
                text:
                  "Structura clara pentru documentare etica, continuitate si colaborare — fara a transforma terapia in „chat la cerere”.",
              },
            ].map((item, index) => (
              <li key={index} className="flex gap-6">
                <span className="shrink-0 w-8 h-8 rounded-full bg-(--color-accent) text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </span>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed max-w-md">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* RIGHT – FLOATING CARD */}
          <div className="relative md:mt-10 z-20">
            <div className="bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--color-accent)_50%,var(--color-primary)_100%)] rounded-xl shadow-md border border-(--color-soft) p-10 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4 leading-snug">
                Construit alaturi de terapeuti
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Modelat de experienta clinica — conceput pentru a sustine documentarea etica,
                continuitatea ingrijirii si o alianta terapeutica puternica.
              </p>

              <Link
                href="/about"
                className="inline-block bg-white hover:bg-(--color-card) text-forceground px-5 py-3 rounded-md text-sm transition"
              >
                Despre abordare
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}