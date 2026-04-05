"use client";

import * as React from "react";
import { apiFetch } from "@/app/_lib/authClient";

export function SecurityCard({ onToast }: { onToast?: (msg: string) => void }) {
  const [pwOld, setPwOld] = React.useState("");
  const [pwNew, setPwNew] = React.useState("");
  const [pwConfirm, setPwConfirm] = React.useState("");
  const [pwSaving, setPwSaving] = React.useState(false);

  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const passwordStrength = React.useMemo(() => {
    const value = pwNew;
    if (!value) {
      return { label: "—", hint: "Alege o parolă nouă", tone: "muted", width: "0%" };
    }

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) {
      return { label: "Slabă", hint: "Adaugă litere mari, cifre sau simboluri", tone: "weak", width: "33%" };
    }
    if (score <= 3) {
      return { label: "Bună", hint: "Ești aproape — mai poți întări parola", tone: "medium", width: "66%" };
    }
    return { label: "Puternică", hint: "Parola ta arată bine", tone: "strong", width: "100%" };
  }, [pwNew]);

  const strengthClasses =
    passwordStrength.tone === "strong"
      ? "bg-emerald-500"
      : passwordStrength.tone === "medium"
        ? "bg-amber-400"
        : passwordStrength.tone === "weak"
          ? "bg-rose-400"
          : "bg-transparent";

  const strengthLevel =
    passwordStrength.width === "100%"
      ? 3
      : passwordStrength.width === "66%"
        ? 2
        : passwordStrength.width === "33%"
          ? 1
          : 0;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwOld || !pwNew || !pwConfirm) {
      onToast?.("Please fill all password fields");
      return;
    }
    if (pwNew.length < 8) {
      onToast?.("New password must be at least 8 characters");
      return;
    }
    if (pwNew !== pwConfirm) {
      onToast?.("Passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      await apiFetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwOld, newPassword: pwNew }),
      });
      setPwOld("");
      setPwNew("");
      setPwConfirm("");
      onToast?.("Password updated");
    } catch (err: any) {
      onToast?.(err?.message || "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div
      className="rounded-[28px] border border-black/5 p-6 shadow-[0_10px_24px_rgba(31,23,32,0.05)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,250,251,0.95) 100%)",
      }}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
          Securitate
        </p>
        <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight text-foreground">
          Parola contului tău
        </h2>
        <p className="mt-2 text-sm leading-7 text-[#74656d]">
          Schimbă parola pentru a-ți menține contul în siguranță.
        </p>
      </div>

      <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handleChangePassword}>
        <div className="relative">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">Parola actuală</label>
          <input
            type={showOldPassword ? "text" : "password"}
            value={pwOld}
            onChange={(e) => setPwOld(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-black/5 bg-white px-4 py-3 pr-12 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
            placeholder="Parola actuală"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword((v) => !v)}
            className="absolute right-3 top-9.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white text-xs font-semibold text-[#7d5d6c] shadow-[0_4px_10px_rgba(31,23,32,0.03)] transition hover:bg-[#fff7fa]"
            aria-label={showOldPassword ? "Ascunde parola veche" : "Arată parola veche"}
          >
            <img
              src={showOldPassword ? "/hide.png" : "/show.png"}
              alt="toggle visibility"
              className="h-4 w-4 object-contain"
            />
          </button>
        </div>

        <div className="relative">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">Parola nouă</label>
          <input
            type={showNewPassword ? "text" : "password"}
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-black/5 bg-white px-4 py-3 pr-12 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
            placeholder="Parola nouă"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            className="absolute right-3 top-9.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white text-xs font-semibold text-[#7d5d6c] shadow-[0_4px_10px_rgba(31,23,32,0.03)] transition hover:bg-[#fff7fa]"
            aria-label={showNewPassword ? "Ascunde parola nouă" : "Arată parola nouă"}
          >
            <img
              src={showNewPassword ? "/hide.png" : "/show.png"}
              alt="toggle visibility"
              className="h-4 w-4 object-contain"
            />
          </button>
          <div className="mt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                Forță parolă
              </p>
              <span className="text-xs font-medium text-[#7d5d6c]">
                {passwordStrength.label}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= strengthLevel
                      ? passwordStrength.tone === "strong"
                        ? "bg-emerald-500"
                        : passwordStrength.tone === "medium"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      : "bg-[#f3eef6]"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs leading-6 text-[#74656d]">
              {passwordStrength.hint}
            </p>
          </div>
        </div>

        <div className="relative">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">Confirmă parola</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-black/5 bg-white px-4 py-3 pr-12 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
            placeholder="Confirmă parola nouă"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-9.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white text-xs font-semibold text-[#7d5d6c] shadow-[0_4px_10px_rgba(31,23,32,0.03)] transition hover:bg-[#fff7fa]"
            aria-label={showConfirmPassword ? "Ascunde confirmarea parolei" : "Arată confirmarea parolei"}
          >
            <img
              src={showConfirmPassword ? "/hide.png" : "/show.png"}
              alt="toggle visibility"
              className="h-4 w-4 object-contain"
            />
          </button>
        </div>

        <div>
          <button
            type="submit"
            disabled={pwSaving}
            className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)] transition hover:opacity-90 disabled:opacity-50"
          >
            {pwSaving ? "Se salvează…" : "Schimbă parola"}
          </button>
        </div>
      </form>
    </div>
  );
}