import Link from "next/link";

export default function FooterCTA() {
  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-(--color-soft) bg-white p-8 md:p-10">
          

          <div className="relative">
            <p className="text-sm font-semibold text-(--color-primary)">Still stuck?</p>
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
                className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Email support@innery.com
              </a>

              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-(--color-card)"
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