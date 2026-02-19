"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, setAccessToken } from "@/app/_lib/authClient";

export default function SignupPageAlt() {
  const [role, setRole] = useState<"therapist" | "client">("therapist");

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        body: JSON.stringify({ email: normalizedEmail, password }),
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

  return (
    <section className="min-h-screen bg-[#F7F8FC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">

        {/* LEFT – CONTEXT */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#F7F8FC]">
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

          <p className="text-xs text-gray-400">
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
                className="accent-indigo-600"
              />
              Therapist
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                checked={role === "client"}
                onChange={() => setRole("client")}
                className="accent-indigo-600"
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
                           focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                           focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                           focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white
                         hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : copy.cta}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}