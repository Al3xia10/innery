"use client";

import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-(--color-card)/40 px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-0 overflow-hidden rounded-3xl border border-(--color-soft) bg-white shadow-sm md:grid-cols-2">
          <aside className="hidden flex-col justify-between bg-(--color-card) p-10 md:flex">
            <div>
              <Link href="/" className="text-sm font-semibold text-gray-900">
                Innery
              </Link>

              <h1 className="mt-14 text-3xl font-semibold leading-tight text-gray-900">
                Un mod mai calm <br /> de a lucra împreună
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
                Innery este construit pentru relații terapeutice pe termen lung: mai puțin
                zgomot, mai multă claritate și continuitate între ședințe.
              </p>
            </div>

            <p className="text-xs text-gray-500/90">Sigur · Privat · Conceput pentru terapie</p>
          </aside>

          <div className="p-6 sm:p-10">
            <div className="mb-8 flex items-center justify-between md:hidden">
              <Link href="/" className="text-sm font-semibold text-gray-900">
                Innery
              </Link>
              <span className="text-xs text-(--color-primary)">Autentificare sigură</span>
            </div>

            <div className="mb-7">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            </div>

            {children}

            {footer ? <div className="mt-8 border-t border-(--color-soft) pt-6 text-sm text-gray-600">{footer}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
