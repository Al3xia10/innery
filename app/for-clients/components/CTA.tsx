import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm md:p-12">
          {/* subtle accents */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-[#FAD2C8]/35 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs font-semibold text-gray-700">
                No pressure <span className="text-gray-300">•</span> Guided by your therapist
              </div>

              <h2 className="mt-5 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
                Ready to feel more grounded
                <br />
                between sessions?
              </h2>

              <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Innery gives you a calm, private space to reflect, remember what matters,
                and stay connected to your therapeutic process — without overwhelm.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-gray-100 px-3 py-1">Private & secure</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">At your own pace</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">No constant messaging</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md:justify-self-end">
              <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur">
                <p className="text-sm font-semibold text-gray-900">
                  Start your Innery space
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Join through your therapist and begin using Innery as part of your
                  therapy journey.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Create client account
                  </Link>

                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    See how it works
                  </Link>

                  <p className="pt-2 text-xs text-gray-500">
                    You’ll only join if your therapist uses Innery.
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