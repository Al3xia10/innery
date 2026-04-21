import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-(--color-soft) bg-white p-8 shadow-sm md:p-12">

          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-(--color-soft) bg-white px-4 py-2 text-xs font-semibold text-gray-700">
                Fara presiune <span className="text-gray-300">•</span> Ghidat(a) de terapeutul tau
              </div>

              <h2 className="mt-5 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
                Gata sa te simti mai ancorat(a)
                <br />
                intre sedinte?
              </h2>

              <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Innery iti ofera un spatiu calm si privat pentru a reflecta, a-ti aminti ce conteaza,
                si a ramane conectat(a) la procesul tau terapeutic — fara coplesire.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-(--color-card) border border-(--color-soft) px-3 py-1">Privat si sigur</span>
                <span className="rounded-full bg-(--color-card) border border-(--color-soft) px-3 py-1">In ritmul tau</span>
                <span className="rounded-full bg-(--color-card) border border-(--color-soft) px-3 py-1">Fara mesaje constante</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md:justify-self-end">
              <div className="rounded-2xl border border-(--color-soft) bg-white p-6 backdrop-blur">
                <p className="text-sm font-semibold text-gray-900">
                  Incepe spatiul tau Innery
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Alatura-te prin terapeutul tau si incepe sa folosesti Innery ca parte din
                  parcursul tau terapeutic.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Creeaza cont de client
                  </Link>

                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-(--color-card)"
                  >
                    Vezi cum functioneaza
                  </Link>

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}