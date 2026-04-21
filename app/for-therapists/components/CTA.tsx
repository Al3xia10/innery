import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-(--color-soft) bg-white p-8 shadow-sm md:p-12">
          {/* subtle accents */}
          

          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-(--color-soft) bg-white px-4 py-2 text-xs font-semibold text-gray-700">
                Acces timpuriu <span className="text-gray-300">•</span> Fara card bancar
              </div>

              <h2 className="mt-5 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
                Gata sa conduci sedinte cu
                <br />
                mai putina administratie?
              </h2>

              <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Innery pastreaza notitele, reflectiile si continuitatea intr-un singur spatiu privat —
                ca sa petreci mai putin timp organizand si mai mult timp in munca clinica.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-(--color-card) border border-(--color-soft) px-3 py-1">Privat implicit</span>
                <span className="rounded-full bg-(--color-card) border border-(--color-soft) px-3 py-1">Construit pentru continuitate</span>
                <span className="rounded-full bg-(--color-card) border border-(--color-soft) px-3 py-1">Fara dezordine</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md:justify-self-end">
              <div className="rounded-2xl border border-(--color-soft) bg-white p-6 md:p-6">
                <p className="text-sm font-semibold text-gray-900">Incepe cu Innery</p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Creeaza-ti contul de terapeut si configureaza primul spatiu de client.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Creeaza cont de terapeut
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-(--color-card)"
                  >
                    Exploreaza planul Clinic
                  </Link>

                  <p className="pt-2 text-xs text-gray-500/90">
                    Tip: Incepe gratuit, apoi faci upgrade cand esti pregatit(a).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
