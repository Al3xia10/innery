"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function readAuthState() {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, workspaceUserId: null as string | null };
  }

  try {
    const savedUser = localStorage.getItem("innery_user");
    if (!savedUser) {
      return { isAuthenticated: false, workspaceUserId: null as string | null };
    }

    const parsedFirst: unknown = JSON.parse(savedUser);
    const parsedUser =
      typeof parsedFirst === "string" ? JSON.parse(parsedFirst) : parsedFirst;
    const workspaceUserId =
      typeof parsedUser === "object" &&
      parsedUser !== null &&
      "id" in parsedUser &&
      parsedUser.id != null
        ? String(parsedUser.id)
        : null;

    return { isAuthenticated: true, workspaceUserId };
  } catch {
    return { isAuthenticated: false, workspaceUserId: null as string | null };
  }
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    workspaceUserId: null as string | null,
  });
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = authState.isAuthenticated;
  const inClientWorkspace = pathname?.startsWith("/client");
  const inTherapistWorkspace = pathname?.startsWith("/therapist");
  const inWorkspace = inClientWorkspace || inTherapistWorkspace;
  const workspaceUserId = authState.workspaceUserId;

  const therapistPathId = pathname?.match(/^\/therapist\/([^/]+)/)?.[1] ?? null;
  const therapistBaseHref =
  therapistPathId || workspaceUserId
    ? `/therapist/${therapistPathId ?? workspaceUserId}`
    : "/therapist";

  useEffect(() => {
    setAuthState(readAuthState());
  }, [pathname]);
  const handleLogout = () => {
    try {
      localStorage.removeItem("innery_user");
      localStorage.removeItem("innery_token");
    } catch {}

    setOpen(false);
    router.push("/");
  };

  useEffect(() => {
    document.documentElement.dataset.inneryNavOpen = open ? "1" : "0";
    window.dispatchEvent(new Event(open ? "innery:nav-open" : "innery:nav-close"));
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--color-soft)/60 bg-white/90">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-14 items-center justify-between md:h-16">
          <Link href="/" className="flex items-center justify-center gap-2.5">
            <img src="/logo.png" alt="Logo Innery" className="mt-0.5 h-12 w-auto shrink-0" />
            <img src="/text-logo.png" alt="Logo Innery" className="h-5.5 w-auto shrink-0" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link
              href="/how-it-works"
              className={`transition ${
                pathname === "/how-it-works"
                  ? "font-semibold text-(--color-accent)"
                  : "text-gray-700 hover:text-(--color-accent)"
              }`}
            >
              Cum functioneaza
            </Link>
            <Link
              href="/for-therapists"
              className={`transition ${
                pathname === "/for-therapists"
                  ? "font-semibold text-(--color-accent)"
                  : "text-gray-700 hover:text-(--color-accent)"
              }`}
            >
              Pentru terapeuti
            </Link>
            <Link
              href="/for-clients"
              className={`transition ${
                pathname === "/for-clients"
                  ? "font-semibold text-(--color-accent)"
                  : "text-gray-700 hover:text-(--color-accent)"
              }`}
            >
              Pentru clienti
            </Link>
            <Link
              href="/support"
              className={`transition ${
                pathname === "/support"
                  ? "font-semibold text-(--color-accent)"
                  : "text-gray-700 hover:text-(--color-accent)"
              }`}
            >
              Suport
            </Link>
          </nav>

          <div className="hidden items-center gap-3 text-sm md:flex">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-(--color-soft) bg-white px-4 py-2 text-gray-900 shadow-sm transition hover:bg-(--color-card)"
              >
                Deconectare
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-xl border border-(--color-soft) bg-white px-4 py-2 text-gray-900 shadow-sm transition hover:bg-(--color-card)"
                >
                  Autentificare
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-xl bg-(--color-accent) px-4 py-2 text-white shadow-sm transition hover:opacity-90"
                >
                  Inregistrare
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-white px-3 py-2 text-gray-900 shadow-sm transition hover:bg-(--color-card) active:scale-[0.98] md:hidden"
            aria-label="Deschide meniul"
            aria-expanded={open}
          >
            <span className="sr-only">Deschide meniul</span>
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

      {open && (
        <div className="fixed inset-0 z-60 md:hidden animate-in fade-in duration-200">
          <button
            aria-label="Inchide meniul"
            className="absolute inset-0 bg-black/35 animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-0 h-screen overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="mx-auto flex min-h-screen max-w-md flex-col px-6">
              <div className="flex h-20 items-center justify-between pt-3">
                <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                  <img src="/logo.png" alt="Logo Innery" className="mt-0.5 h-10 w-auto shrink-0" />
                  <img src="/text-logo.png" alt="Logo Innery" className="h-5 w-auto shrink-0" />
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--color-soft) bg-white text-gray-900 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-(--color-card) active:scale-[0.98]"
                  aria-label="Inchide meniul"
                >
                  <span className="sr-only">Inchide meniul</span>
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

              <div className="flex flex-1 flex-col pb-10 pt-4 mt-14">
                {inWorkspace ? (
                  <>
                    <div className="mb-8 mt-6 rounded-3xl border border-(--color-soft) px-5 py-4 text-center shadow-sm">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-(--color-accent)">
                        {inClientWorkspace ? "workspace client" : "workspace terapeut"}
                      </p>
                    </div>

                    <nav className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-base">
                      {inClientWorkspace ? (
                        <>
                          <Link
                            href="/client"
                            onClick={() => setOpen(false)}
                            className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                              pathname === "/client"
                                ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                                : "text-gray-800 hover:bg-(--color-card)"
                            }`}
                          >
                            Panou
                          </Link>
                          <Link
                            href="/client/progress"
                            onClick={() => setOpen(false)}
                            className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                              pathname.startsWith("/client/progress")
                                ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                                : "text-gray-800 hover:bg-(--color-card)"
                            }`}
                          >
                            Progres
                          </Link>
                          <Link
                            href="/client/journal"
                            onClick={() => setOpen(false)}
                            className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                              pathname.startsWith("/client/journal")
                                ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                                : "text-gray-800 hover:bg-(--color-card)"
                            }`}
                          >
                            Jurnal
                          </Link>
                          <Link
                            href="/client/plan"
                            onClick={() => setOpen(false)}
                            className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                              pathname.startsWith("/client/plan")
                                ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                                : "text-gray-800 hover:bg-(--color-card)"
                            }`}
                          >
                            Plan
                          </Link>
                          <Link
                            href="/client/settings"
                            onClick={() => setOpen(false)}
                            className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                              pathname.startsWith("/client/settings")
                                ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                                : "text-gray-800 hover:bg-(--color-card)"
                            }`}
                          >
                            Setari
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href={therapistBaseHref}
                            onClick={() => setOpen(false)}
                            className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                              pathname === therapistBaseHref
                                ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                                : "text-gray-800 hover:bg-(--color-card)"
                            }`}
                          >
                            Panou
                          </Link>
                          <Link
                        href={`${therapistBaseHref}/clients`}
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname.startsWith(`${therapistBaseHref}/clients`)
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Clienti
                      </Link>
                                                <Link
                        href={`${therapistBaseHref}/sessions`}
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname.startsWith(`${therapistBaseHref}/sessions`)
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Sedinte
                      </Link>
                                                <Link
                        href={`${therapistBaseHref}/notes`}
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname.startsWith(`${therapistBaseHref}/notes`)
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Notite
                      </Link>
                                                <Link
                        href={`${therapistBaseHref}/settings`}
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname.startsWith(`${therapistBaseHref}/settings`)
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Setari
                      </Link>
                        </>
                      )}
                    </nav>

                    <div className="mt-auto mx-auto w-full max-w-sm border-t border-(--color-soft)/60 pt-6">
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-transparent bg-(--color-accent) px-4 py-3.5 text-[1.02rem] font-medium text-white shadow-sm transition duration-200 hover:opacity-95 active:scale-[0.99]"
                    >
                      Inapoi la site-ul principal
                    </Link>

                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-(--color-soft) bg-white px-4 py-3.5 text-[1.02rem] font-medium text-gray-900 shadow-sm transition duration-200 hover:bg-(--color-card) active:scale-[0.99]"
                      >
                        Deconectare
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setOpen(false)}
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-(--color-soft) bg-white px-4 py-3.5 text-[1.02rem] font-medium text-gray-900 shadow-sm transition duration-200 hover:bg-(--color-card) active:scale-[0.99]"
                        >
                          Autentificare
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setOpen(false)}
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-(--color-card) px-4 py-3.5 text-[1.02rem] font-medium text-gray-900 shadow-sm transition duration-200 hover:bg-white active:scale-[0.99]"
                        >
                          Inregistrare
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                  </>
                ) : (
                  <>
                    <div className="mb-7 mt-14 text-center">
                    <p className="text-[0.88rem] font-semibold uppercase tracking-[0.42em] text-(--color-accent)">
                      meniu
                    </p>
                    <h2 className="mt-3 text-[2rem] font-semibold tracking-tight text-gray-900">
                      Explorează Innery
                    </h2>
                  </div>
                    <nav className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-base">
                      <Link
                        href="/how-it-works"
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname === "/how-it-works"
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Cum functioneaza
                      </Link>
                      <Link
                        href="/for-therapists"
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname === "/for-therapists"
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Pentru terapeuti
                      </Link>
                      <Link
                        href="/for-clients"
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname === "/for-clients"
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Pentru clienti
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setOpen(false)}
                        className={`w-full rounded-2xl px-6 py-[1.05rem] text-center text-[1.08rem] font-medium transition duration-200 ${
                          pathname === "/support"
                            ? "bg-(--color-card) font-semibold text-(--color-accent) shadow-sm ring-1 ring-(--color-soft)"
                            : "text-gray-800 hover:bg-(--color-card)"
                        }`}
                      >
                        Suport
                      </Link>
                    </nav>

                    <div className="mt-auto mx-auto grid w-full max-w-sm grid-cols-1 gap-3 border-t border-(--color-soft)/60 pt-6">
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="inline-flex items-center justify-center rounded-2xl border border-(--color-soft) bg-white px-4 py-3.5 text-[1.02rem] font-medium text-gray-900 shadow-sm transition duration-200 hover:bg-(--color-card) active:scale-[0.99]"
                        >
                          Deconectare
                        </button>
                      ) : (
                        <>
                          <Link
                            href="/auth/login"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center justify-center rounded-2xl border border-(--color-soft) bg-white px-4 py-3.5 text-[1.02rem] font-medium text-gray-900 shadow-sm transition duration-200 hover:bg-(--color-card) active:scale-[0.99]"
                          >
                            Autentificare
                          </Link>
                          <Link
                            href="/auth/signup"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center justify-center rounded-2xl bg-(--color-accent) px-4 py-3.5 text-[1.02rem] font-medium text-white shadow-sm transition duration-200 hover:opacity-95 active:scale-[0.99]"
                          >
                            Inregistrare
                          </Link>
                        </>
                      )}
                    </div>

                    <p className="mt-5 pb-2 text-center text-[0.72rem] text-gray-500/90">
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
