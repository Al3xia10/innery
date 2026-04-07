"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, setAccessToken } from "@/app/_lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedRole = searchParams.get("role");
  const [role, setRole] = useState<"therapist" | "client">(
    requestedRole === "client" ? "client" : "therapist"
  );

  useEffect(() => {
    if (requestedRole === "client") {
      setRole("client");
      return;
    }

    if (requestedRole === "therapist") {
      setRole("therapist");
    }
  }, [requestedRole]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showSessionLoader, setShowSessionLoader] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [sessionNoticeProgress, setSessionNoticeProgress] = useState(100);

  const copy = useMemo(() => {
    if (role === "therapist") {
      return {
        title: "Sign in to your therapist workspace",
        subtitle:
          "Pick up where you left off — sessions, notes, clients and continuity in one calm space.",
        primaryCta: "Log in as therapist",
      };
    }

    return {
      title: "Sign in to your client space",
      subtitle:
        "Continue your reflections and stay connected between sessions — privately and at your pace.",
      primaryCta: "Log in as client",
    };
  }, [role]);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const rawUser = localStorage.getItem("innery_user");

        if (!rawUser) {
          if (!cancelled) setIsCheckingSession(false);
          return;
        }

        const me = await apiFetch("/api/me");

        if (cancelled) return;

        const user = me?.user ?? me;

        if (user?.role === "therapist" && user?.id) {
          if (requestedRole === "client") {
            setSessionNotice(
              "You’re already signed in as a therapist, not a client. Redirecting you to your therapist workspace..."
            );
            setSessionNoticeProgress(100);

            window.setTimeout(() => {
              router.replace(`/therapist/${user.id}`);
            }, 2800);
          } else {
            router.replace(`/therapist/${user.id}`);
          }
          return;
        }

        if (user?.role === "client") {
          if (requestedRole === "therapist") {
            setSessionNotice(
              "You’re already signed in as a client, not a therapist. Redirecting you to your client space..."
            );
            setSessionNoticeProgress(100);

            window.setTimeout(() => {
              router.replace(`/client`);
            }, 2800);
          } else {
            router.replace(`/client`);
          }
          return;
        }
      } catch {
        try {
          localStorage.removeItem("innery_user");
        } catch {}
      }

      if (!cancelled) {
        setIsCheckingSession(false);
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!isCheckingSession) {
      setShowSessionLoader(false);
      return;
    }

    if (sessionNotice) {
      setShowSessionLoader(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowSessionLoader(true);
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isCheckingSession, sessionNotice]);


  useEffect(() => {
    if (!sessionNotice) {
      setSessionNoticeProgress(100);
      return;
    }

    setSessionNoticeProgress(100);

    const totalDuration = 2800;
    const intervalMs = 40;
    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, 100 - (elapsed / totalDuration) * 100);
      setSessionNoticeProgress(next);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionNotice]);

  if (isCheckingSession) {
    return (
      <section className="min-h-screen bg-(--color-card)/40 px-4 py-12">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          {sessionNotice ? (
            <div className="w-full max-w-md rounded-3xl border border-(--color-soft) bg-white px-5 py-4 shadow-[0_18px_40px_rgba(31,23,32,0.14)] ring-1 ring-(--color-soft)">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-soft) text-(--color-primary)">
                  <span className="text-base font-semibold">i</span>
                </div>
                <div className="w-full">
                  <p className="text-sm font-semibold text-slate-900">Access notice</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{sessionNotice}</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-(--color-card)">
                    <div
                      className="h-full rounded-full bg-(--color-accent) transition-[width] duration-75 ease-linear"
                      style={{ width: `${sessionNoticeProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-(--color-primary)">
                    Redirecting in a moment...
                  </p>
                </div>
              </div>
            </div>
          ) : showSessionLoader ? (
            <div className="flex items-center gap-3 rounded-2xl border border-(--color-soft) bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-(--color-soft) border-t-(--color-accent)" />
              <span>Checking your session...</span>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-(--color-card)/40 px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-(--color-soft) bg-white shadow-sm">
          {/* LEFT – CONTEXT (desktop) */}
          <aside className="hidden md:flex flex-col justify-between bg-(--color-card) p-10">
            <div>
              <Link href="/" className="text-sm font-semibold text-gray-900">
                Innery
              </Link>

              <h1 className="mt-14 text-3xl font-semibold leading-tight text-gray-900">
                A calmer way <br /> to work together
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
                Innery is built for long-term therapeutic relationships — less
                noise, more clarity, and continuity between sessions.
              </p>
            </div>

            <p className="text-xs text-gray-500/90">Secure · Private · Designed for therapy</p>
          </aside>

          {/* RIGHT – FORM */}
          <div className="p-6 sm:p-10">
            {/* Mobile brand row */}
            <div className="mb-8 flex items-center justify-between md:hidden">
              <Link href="/" className="text-sm font-semibold text-gray-900">
                Innery
              </Link>
              <span className="text-xs text-(--color-primary)">Secure sign in</span>
            </div>

            <div className="mb-7">
              <h2 className="text-xl font-semibold text-gray-900">{copy.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{copy.subtitle}</p>
            </div>

            {/* ROLE SWITCH (radio) */}
            <fieldset className="mb-6">
              <legend className="sr-only">Select role</legend>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="role"
                    value="therapist"
                    checked={role === "therapist"}
                    onChange={() => setRole("therapist")}
                    className="accent-(--color-accent)"
                  />
                  Therapist
                </label>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={role === "client"}
                    onChange={() => setRole("client")}
                    className="accent-(--color-accent)"
                  />
                  Client
                </label>
              </div>
            </fieldset>

            {/* FORM */}
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setIsSubmitting(true);

                try {
                  const data = await apiFetch("/api/auth/login", {
                    method: "POST",
                     body: JSON.stringify({
                      email: email.trim().toLowerCase(),
                      password,
                      rememberMe,
                    }),
                  });

                  setAccessToken(data.accessToken);
                  setIsCheckingSession(false);

                  const user = data.user;

                  try {
                    localStorage.setItem("innery_user", JSON.stringify(user));
                  } catch {}

                  setTimeout(() => {
                    if (user?.role === "therapist") {
                      router.push(`/therapist/${user.id}`);
                    } else {
                      router.push(`/client`);
                    }
                  }, 50);
                } catch (err: any) {
                  setError(err?.message || "Login failed");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-(--color-accent) hover:opacity-90"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border border-gray-300 accent-(--color-accent)"
                />
                <span>Keep me signed in for 30 days</span>
              </label>


              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-(--color-accent) px-4 py-3 text-sm font-semibold text-white
                           transition hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : copy.primaryCta}
              </button>

              {error ? (
                <p className="text-xs text-red-600">{error}</p>
              ) : (
                <p className="text-xs text-gray-500/90">Your account is protected with secure sign-in.</p>
              )}
            </form>

            <div className="mt-8 border-t border-(--color-soft) pt-6 text-sm text-gray-600">
              <span>Don’t have an account?</span>{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-(--color-accent) hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
