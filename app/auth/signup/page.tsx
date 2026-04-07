"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, setAccessToken } from "@/app/_lib/authClient";

export default function SignupPageAlt() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedRole = searchParams.get("role");
  const [role, setRole] = useState<"therapist" | "client">(
    requestedRole === "client" ? "client" : "therapist"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showSessionLoader, setShowSessionLoader] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [sessionNoticeProgress, setSessionNoticeProgress] = useState(100);

  useEffect(() => {
    if (requestedRole === "client") {
      setRole("client");
      return;
    }

    if (requestedRole === "therapist") {
      setRole("therapist");
    }
  }, [requestedRole]);

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
  }, [requestedRole, router]);

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

  const copy = useMemo(() => {
    if (role === "therapist") {
      return {
        title: "Create your therapist account",
        subtitle:
          "Organize sessions, notes and client progress in one private workspace.",
        cta: "Create therapist account",
      };
    }
    return {
      title: "Create your client account",
      subtitle:
        "A calm, private space for reflections and shared progress with your therapist.",
      cta: "Create client account",
    };
  }, [role]);

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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1) Create account
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          role,
          name: name.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      // 2) Auto-login
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password, rememberMe: false }),
      });

      setAccessToken(data.accessToken);
      try {
        localStorage.setItem("innery_user", JSON.stringify(data.user));
      } catch {}

      if (data.user?.role === "therapist") {
        router.push(`/therapist/${data.user.id}`);
      } else {
        // Client portal should not depend on ID in the URL
        router.push(`/client`);
      }
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-(--color-card)/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-(--color-soft) bg-white shadow-sm">

        {/* LEFT – CONTEXT */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-(--color-card)">
          <div>
            <Link href="/" className="text-sm font-semibold text-gray-900">
              Innery
            </Link>

            <h1 className="mt-12 text-3xl font-semibold text-gray-900 leading-tight">
              A calmer way <br /> to work together
            </h1>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-sm">
              Innery is built for long-term therapeutic relationships — less noise,
              more clarity, and continuity between sessions.
            </p>
          </div>

          <p className="text-xs text-gray-500/90">
            Secure · Private · Designed for therapy
          </p>
        </div>

        {/* RIGHT – FORM */}
        <div className="p-6 sm:p-8 md:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {copy.subtitle}
            </p>
          </div>

          {/* ROLE SELECT */}
          <div className="mb-6 space-y-2">
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                checked={role === "therapist"}
                onChange={() => setRole("therapist")}
                className="accent-(--color-accent)"
              />
              Therapist
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                checked={role === "client"}
                onChange={() => setRole("client")}
                className="accent-(--color-accent)"
              />
              Client
            </label>
          </div>

          {/* FORM */}
          <form className="space-y-4" onSubmit={handleSignup}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 rounded-xl bg-(--color-accent) py-2.5 text-sm font-semibold text-white
                         transition hover:opacity-90 "
            >
              {isSubmitting ? "Creating..." : copy.cta}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-(--color-soft) text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href={`/auth/login?role=${role}`}
              className="font-medium text-(--color-accent) hover:opacity-90"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}