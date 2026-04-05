"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const inClientWorkspace = pathname?.startsWith("/client");
  const inTherapistWorkspace = pathname?.startsWith("/therapist");
  const inWorkspace = inClientWorkspace || inTherapistWorkspace;

  useEffect(() => {
    // flag global: sidebar dock se ascunde când meniul navbar e deschis
    document.documentElement.dataset.inneryNavOpen = open ? "1" : "0";

    // evenimente (mai robuste)
    window.dispatchEvent(new Event(open ? "innery:nav-open" : "innery:nav-close"));
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center justify-center gap-2.5">
          <img src="/logo.png" alt="Innery logo" className="mt-0.5 h-12 w-auto shrink-0" />
          <img src="/text-logo.png" alt="Innery logo" className="h-5.5 w-auto shrink-0" />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/how-it-works" className={`transition ${
              pathname === "/how-it-works"
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-600"
            }`}>
              How it works
            </Link>
            <Link href="/for-therapists" className={`transition ${
              pathname === "/for-therapists"
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-600"
            }`}>
              For therapists
            </Link>
            <Link href="/for-clients" className={`transition ${
              pathname === "/for-clients"
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-600"
            }`}>
              For clients
            </Link>
            <Link href="/support" className={`transition ${
              pathname === "/support"
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-600"
            }`}>
              Support
            </Link>
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition shadow-sm"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            >
              Sign up
            </Link>
          </div>

          {/* MOBILE: Burger (only under md) */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {open && (
        <div className="md:hidden fixed inset-0 z-60">
          {/* backdrop */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
          />

          {/* panel */}
          <div className="absolute inset-x-0 top-0 bg-white shadow-2xl">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex h-14 items-center justify-between">
                <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setOpen(false)}
              >
                <img src="/logo.png" alt="Innery logo" className="mt-0.5 h-9 w-auto shrink-0" />
                <img src="/text-logo.png" alt="Innery logo" className="h-4.5 w-auto shrink-0" />
              </Link>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition"
                  aria-label="Close menu"
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="pb-8 pt-4">
                {inWorkspace ? (
                  <>
                    <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                        {inClientWorkspace ? "client workspace" : "therapist workspace"}
                      </p>
                     
                    </div>

                    <nav className="flex flex-col gap-2 text-base">
                      {inClientWorkspace ? (
                        <>
                          <Link
                            href="/client"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname === "/client"
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/client/progress"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/client/progress")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Progress
                          </Link>
                          <Link
                            href="/client/journal"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/client/journal")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Journal
                          </Link>
                          <Link
                            href="/client/plan"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/client/plan")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Plan
                          </Link>
                          <Link
                            href="/client/settings"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/client/settings")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Settings
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/therapist"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname === "/therapist"
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/therapist/clients"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/therapist/clients")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Clients
                          </Link>
                          <Link
                            href="/therapist/sessions"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/therapist/sessions")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Sessions
                          </Link>
                          <Link
                            href="/therapist/notes"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/therapist/notes")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Notes
                          </Link>
                          <Link
                            href="/therapist/settings"
                            onClick={() => setOpen(false)}
                            className={`rounded-xl px-3 py-3 transition ${
                              pathname.startsWith("/therapist/settings")
                                ? "bg-indigo-50 text-indigo-700 font-semibold"
                                : "text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Settings
                          </Link>
                        </>
                      )}
                    </nav>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-indigo-500 px-4 py-3 text-white font-medium hover:bg-indigo-600 transition shadow-sm w-full"
                      >
                        Back to main site
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <nav className="flex flex-col gap-2 text-base">
                      <Link
                        href="/how-it-works"
                        onClick={() => setOpen(false)}
                        className={`rounded-xl px-3 py-3 transition ${
                          pathname === "/how-it-works"
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        How it works
                      </Link>
                      <Link
                        href="/for-therapists"
                        onClick={() => setOpen(false)}
                        className={`rounded-xl px-3 py-3 transition ${
                          pathname === "/for-therapists"
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        For therapists
                      </Link>
                      <Link
                        href="/for-clients"
                        onClick={() => setOpen(false)}
                        className={`rounded-xl px-3 py-3 transition ${
                          pathname === "/for-clients"
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        For clients
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setOpen(false)}
                        className={`rounded-xl px-3 py-3 transition ${
                          pathname === "/support"
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Support
                      </Link>
                    </nav>

                    <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6">
                      <Link
                        href="/auth/login"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 transition shadow-sm"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
                      >
                        Sign up
                      </Link>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-500">
                      © {new Date().getFullYear()} Innery
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}