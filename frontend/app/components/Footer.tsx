"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden w-full bg-(--color-card)">

      {/* WAVE – transition from blue to pink */}
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute -top-px left-0 w-full h-36 fill-[#ffffff]"
      >
        <path
          d="
            M0,120
            C200,60 400,40 600,80
            C800,120 1000,140 1200,80
            L1200,0
            L0,0
            Z
          "
        />
      </svg>

      {/* FOOTER CONTENT */}
      <div className="relative z-10 pt-32 mx-auto max-w-6xl px-6 sm:pt-36">

        <div className="flex flex-col gap-12 md:flex-row md:justify-between">

          {/* LEFT – BRAND + SOCIAL */}
          <div className="flex max-w-sm flex-col items-center gap-6 text-center md:items-start md:text-left">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Innery</h4>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                Un spatiu sigur si modern, unde terapia incepe cu intelegere,
                conexiune si grija.
              </p>
            </div>

            {/* SOCIAL ICONS */}
            <div className="flex items-center justify-center gap-4 md:justify-start">
              {/* Instagram */}
              <a
                href="https://instagram.com/_.alexiaaa.____/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-11 w-11 rounded-full bg-black/80 flex items-center justify-center transition hover:bg-black active:scale-[0.97]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5 text-white"
                >
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="17.5" cy="6.5" r="0.75" fill="white" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                className="h-11 w-11 rounded-full bg-black/80 flex items-center justify-center transition hover:bg-black active:scale-[0.97]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0zM8 8h4.8v2.2h.07c.67-1.27 2.3-2.6 4.73-2.6C22.4 7.6 24 10.2 24 15.1V24h-5v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.07V24H8z"/>
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="#"
                className="h-11 w-11 rounded-full bg-black/80 flex items-center justify-center transition hover:bg-black active:scale-[0.97]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path d="M24 4.56c-.89.39-1.84.65-2.84.77a4.94 4.94 0 002.17-2.72c-.95.56-2.01.97-3.13 1.19A4.92 4.92 0 0016.62 3c-2.73 0-4.94 2.22-4.94 4.95 0 .39.04.77.13 1.13C7.69 8.9 4.07 6.96 1.64 3.96a4.95 4.95 0 00-.67 2.49c0 1.72.87 3.24 2.19 4.13a4.9 4.9 0 01-2.24-.62v.06c0 2.4 1.7 4.4 3.95 4.86a4.93 4.93 0 01-2.23.08c.63 1.97 2.45 3.4 4.6 3.44A9.88 9.88 0 010 20.29a13.94 13.94 0 007.55 2.21c9.05 0 14-7.5 14-14v-.64A9.93 9.93 0 0024 4.56z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* RIGHT – NAV */}
          <div className="flex flex-col items-center gap-4 text-sm text-center md:items-start md:text-left">
            <span className="text-gray-900 uppercase tracking-wide text-xs">
              Exploreaza
            </span>
            <nav className="flex flex-col gap-3.5 font-medium text-gray-700">
              <Link href="/therapist" className="px-2 py-1.5 hover:text-(--color-accent) transition active:scale-[0.98]">Pentru terapeuti</Link>
              <Link href="/client" className="px-2 py-1.5 hover:text-(--color-accent) transition active:scale-[0.98]">Pentru clienti</Link>
              <Link href="/about" className="px-2 py-1.5 hover:text-(--color-accent) transition active:scale-[0.98]">Despre Innery</Link>
              <Link href="/contact" className="px-2 py-1.5 hover:text-(--color-accent) transition active:scale-[0.98]">Contact</Link>
            </nav>

    
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="mt-12 mb-6 pt-6 border-t border-(--color-accent) text-[0.75rem] text-gray-700">
          <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <p>© 2026 Innery. Toate drepturile rezervate.</p>
            <div className="flex items-center gap-2">
              <Link href="/privacy-policy" className="underline hover:text-(--color-accent)">
                Politica de confidentialitate
              </Link>
              <span>·</span>
              <Link href="/terms-and-conditions" className="underline hover:text-(--color-accent)">
                Termeni si conditii
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
