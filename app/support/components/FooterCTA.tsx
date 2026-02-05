import Link from "next/link";

export default function FooterCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-[#F7F8FC] p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-[#FAD2C8]/35 blur-3xl" />
          </div>

          <div className="relative">
            <p className="text-sm font-semibold text-indigo-600">Still stuck?</p>
            <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
              Tell us what you’re building
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl">
              Include your role (therapist/client), the URL you opened, and what you expected.
              If possible, attach a screenshot.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:support@innery.com?subject=Innery%20Support"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Email support@innery.com
              </a>

              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Revisit How it works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}