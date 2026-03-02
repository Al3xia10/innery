"use client";

import * as React from "react";
import { apiFetch } from "@/app/_lib/authClient";

export function SecurityCard({ onToast }: { onToast?: (msg: string) => void }) {
  const [pwOld, setPwOld] = React.useState("");
  const [pwNew, setPwNew] = React.useState("");
  const [pwConfirm, setPwConfirm] = React.useState("");
  const [pwSaving, setPwSaving] = React.useState(false);

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
      className="rounded-3xl border border-black/5 shadow-sm p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
    >
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Security</h2>
        <p className="mt-1 text-sm text-gray-600">Keep your account safe.</p>
      </div>

      <form className="mt-5 grid grid-cols-1 gap-4" onSubmit={handleChangePassword}>
        <div>
          <label className="text-xs font-semibold text-gray-600">Old password</label>
          <input
            type="password"
            value={pwOld}
            onChange={(e) => setPwOld(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Old password"
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">New password</label>
          <input
            type="password"
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="New password"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Confirm new password</label>
          <input
            type="password"
            value={pwConfirm}
            onChange={(e) => setPwConfirm(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={pwSaving}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:opacity-50 transition"
          >
            {pwSaving ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}