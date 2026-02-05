import Link from "next/link";

export default function Hero() {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold text-indigo-600">Support</p>

      <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
        Help that fits how Innery is used
      </h1>

      <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
        Quick answers for therapists and clients — invitations, notes, reflections,
        access, and account issues.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href="mailto:support@innery.com?subject=Innery%20Support"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Email support
        </a>

        <Link
          href="/how-it-works"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
        >
          How Innery works
          <span className="ml-2 text-gray-400">→</span>
        </Link>
      </div>
    </div>
  );
}