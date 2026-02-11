"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, setAccessToken } from "@/app/_lib/authClient";

export default function LoginPage() {
  const [role, setRole] = useState<"therapist" | "client">("therapist");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <section className="min-h-screen bg-[#F7F8FC] px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          {/* LEFT – CONTEXT (desktop) */}
          <aside className="hidden md:flex flex-col justify-between bg-[#F7F8FC] p-10">
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

            <p className="text-xs text-gray-400">Secure · Private · Designed for therapy</p>
          </aside>

          {/* RIGHT – FORM */}
          <div className="p-6 sm:p-10">
            {/* Mobile brand row */}
            <div className="mb-8 flex items-center justify-between md:hidden">
              <Link href="/" className="text-sm font-semibold text-gray-900">
                Innery
              </Link>
              <span className="text-xs text-gray-500">Secure sign in</span>
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
                    className=" accent-indigo-600"
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
                    className=" accent-indigo-600"
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
                    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
                  });

                  setAccessToken(data.accessToken);

                  const user = data.user; // { id, role, name, email }
                  // Persist the user so other pages (e.g. Clients) can read therapistId/role
                  try {
                    localStorage.setItem("innery_user", JSON.stringify(user));
                  } catch {}
                  if (user?.role === "therapist") {
                    router.push(`/therapist/${user.id}`);
                  } else {
                    router.push(`/client/${user.id}`);
                  }
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
                             focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
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
                             focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white
                           hover:bg-indigo-700 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : copy.primaryCta}
              </button>

              {error ? (
                <p className="text-xs text-red-600">{error}</p>
              ) : (
                <p className="text-xs text-gray-500">Your account is protected with secure sign-in.</p>
              )}
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-600">
              <span>Don’t have an account?</span>{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-700"
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
