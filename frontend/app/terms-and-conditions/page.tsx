import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-(--color-card)/40 min-h-screen">
      <section className="mx-auto max-w-4xl px-6 py-14 md:py-18">
        <article className="relative rounded-3xl border border-(--color-soft) bg-white p-6 shadow-sm md:p-10">
          <Link
            href="/"
            aria-label="Inchide si revino la homepage"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--color-soft) bg-white text-gray-700 shadow-sm transition hover:bg-(--color-card)"
          >
            ×
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
            Legal
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">
            Termeni si conditii
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ultima actualizare: 21 aprilie 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
            <section>
              <h2 className="text-base font-semibold text-gray-900">1. Acceptarea termenilor</h2>
              <p className="mt-2">
                Prin accesarea si utilizarea platformei Innery, confirmi ca ai citit, inteles si acceptat acesti
                termeni. Daca nu esti de acord, nu utiliza platforma.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">2. Descrierea serviciului</h2>
              <p className="mt-2">
                Innery este o platforma digitala pentru organizarea colaborarii terapeut-client (notite, obiective,
                progres, continut intre sesiuni). Platforma nu ofera diagnostic, tratament medical sau urgenta
                psihiatrica.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">3. Eligibilitate si cont</h2>
              <p className="mt-2">
                Utilizatorul trebuie sa furnizeze informatii corecte la creare cont si sa mentina securitatea
                credentialelor. Esti responsabil pentru activitatea desfasurata prin contul tau.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">4. Utilizare permisa</h2>
              <p className="mt-2">
                Este interzisa utilizarea platformei pentru activitati ilegale, acces neautorizat, distribuire de
                malware, scraping abuziv, publicare de continut daunator sau incalcarea drepturilor altor persoane.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">5. Roluri si responsabilitati</h2>
              <p className="mt-2">
                Terapeutii sunt responsabili pentru continutul profesional introdus si pentru conformitatea cu normele
                legale/etice aplicabile profesiei lor. Clientii sunt responsabili pentru continutul propriu si pentru
                comunicarea corecta cu terapeutul.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">6. Proprietate intelectuala</h2>
              <p className="mt-2">
                Codul, designul, elementele vizuale si marca Innery apartin platformei sau licentiatorilor sai.
                Utilizatorii pastreaza drepturile asupra continutului propriu introdus in cont, acordand Innery o
                licenta limitata necesara pentru operarea serviciului.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">7. Disponibilitate si modificari</h2>
              <p className="mt-2">
                Putem modifica, suspenda sau intrerupe anumite functionalitati pentru mentenanta, securitate sau
                imbunatatiri. Ne straduim sa mentinem disponibilitate ridicata, fara garantie de functionare
                neintrerupta.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">8. Limitarea raspunderii</h2>
              <p className="mt-2">
                In masura permisa de lege, Innery nu raspunde pentru pierderi indirecte, incidentale sau consecvente
                rezultate din utilizarea ori imposibilitatea utilizarii platformei. In urgente medicale, contacteaza
                serviciile specializate locale.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">9. Suspendare sau incetare cont</h2>
              <p className="mt-2">
                Putem suspenda ori inchide conturi care incalca acesti termeni, legislatia aplicabila sau securitatea
                platformei. Utilizatorii pot solicita inchiderea contului in orice moment.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">10. Lege aplicabila</h2>
              <p className="mt-2">
                Acesti termeni sunt guvernati de legislatia aplicabila din Romania, fara a aduce atingere drepturilor
                obligatorii ale consumatorilor prevazute de lege.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">11. Contact</h2>
              <p className="mt-2">
                Pentru intrebari legate de acesti termeni, ne poti scrie la:
                <a className="ml-1 font-medium text-(--color-accent) hover:underline" href="mailto:support@innery.com">
                  support@innery.com
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
