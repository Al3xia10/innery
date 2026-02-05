"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients, therapists, reflections as allReflections } from "@/app/_mock/data";

type Reflection = {
  id: string;
  clientId: string;
  date: string;
  content: string;
};

type ClientProfileOverride = {
  name: string;
  email: string;
};

function profileKey(clientId: string) {
  return `innery_client_profile_${clientId}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uid(prefix = "r") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function toNiceDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compareByDateDesc(a: { date: string }, b: { date: string }) {
  const da = new Date(a.date).getTime();
  const db = new Date(b.date).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return b.date.localeCompare(a.date);
  return db - da;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (first + last).toUpperCase();
}

export default function ClientDashboard() {
  const params = useParams<{ clientId: string }>();
  const clientId = params?.clientId ?? "";

  const [profile, setProfile] = React.useState<ClientProfileOverride | null>(null);

  const client = React.useMemo(() => clients.find((c) => c.id === clientId), [clientId]);

  React.useEffect(() => {
    if (!clientId || !client) return;

    const fallbackEmail = (client as any).email ?? "client@innery.com";
    const existing = safeParse<ClientProfileOverride>(
      localStorage.getItem(profileKey(clientId))
    );

    if (existing) {
      setProfile({
        name: (existing.name ?? client.name).toString(),
        email: (existing.email ?? fallbackEmail).toString(),
      });
    } else {
      setProfile({ name: client.name, email: fallbackEmail });
    }
  }, [clientId, client]);

  const displayName = profile?.name ?? client?.name ?? "Client";

  const therapist = React.useMemo(
    () => therapists.find((t) => t.id === client?.therapistId),
    [client?.therapistId]
  );

  const seedReflections = React.useMemo<Reflection[]>(() => {
    return (allReflections as unknown as Reflection[])
      .filter((r) => r.clientId === clientId)
      .slice()
      .sort(compareByDateDesc);
  }, [clientId]);

  const [reflections, setReflections] = React.useState<Reflection[]>(seedReflections);
  const [draft, setDraft] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setReflections(seedReflections);
    setDraft("");
    setSaving(false);
  }, [seedReflections]);

  const lastReflection = reflections[0];

  async function onSaveQuickReflection() {
    const content = draft.trim();
    if (!content) return;

    setSaving(true);
    // simulate saving latency (demo)
    await new Promise((r) => setTimeout(r, 250));

    const next: Reflection = {
      id: uid("r"),
      clientId,
      date: new Date().toISOString(),
      content,
    };

    setReflections((prev) => [next, ...prev]);
    setDraft("");
    setSaving(false);
  }

  if (!client) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">Client not found</h1>
          <p className="mt-2 text-sm text-gray-600">Check the URL. This is a demo route.</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition"
          >
            Go home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Client space
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Welcome back, {displayName}</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            A private space for reflection, progress, and your therapy journey.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/client/${clientId}/reflections`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            Reflections
          </Link>
          <Link
            href={`/client/${clientId}/settings`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            Settings
          </Link>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reflections"
          value={reflections.length.toString()}
          subtitle="your private notes"
          href={`/client/${clientId}/reflections`}
        />
        <StatCard
          title="Last reflection"
          value={lastReflection ? toNiceDate(lastReflection.date) : "—"}
          subtitle="most recent entry"
          href={`/client/${clientId}/reflections`}
        />
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Status</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">Active</p>
          <p className="mt-1 text-xs text-gray-500">therapy in progress</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Therapist</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 truncate">{therapist?.name ?? "—"}</p>
          <p className="mt-1 text-xs text-gray-500">your primary support</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* QUICK REFLECTION */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Quick reflection</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Write a few lines now. You can edit it later in the reflections page.
                </p>
              </div>
              <Link
                href={`/client/${clientId}/reflections`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Open
              </Link>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What are you noticing today?"
              className="mt-5 w-full min-h-35 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">Demo mode • saved in-memory • refresh resets</p>
              <button
                type="button"
                onClick={onSaveQuickReflection}
                disabled={!draft.trim() || saving}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:opacity-50 transition"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          {/* RECENT REFLECTIONS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Recent reflections</h2>
                <p className="mt-1 text-sm text-gray-600">Your latest entries.</p>
              </div>
              <Link
                href={`/client/${clientId}/reflections`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                View all
              </Link>
            </div>

            {reflections.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm font-semibold text-gray-900">No reflections yet</p>
                <p className="mt-1 text-sm text-gray-600">Write your first one above.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {reflections.slice(0, 3).map((r) => (
                  <div key={r.id} className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
                    <p className="text-sm text-gray-900 leading-relaxed">{r.content}</p>
                    <p className="mt-2 text-xs text-gray-500">{toNiceDate(r.date)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* THERAPIST CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900">Your therapist</h2>
            <p className="mt-1 text-sm text-gray-600">Your support space</p>

            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                {initials(therapist?.name ?? "Therapist")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{therapist?.name ?? "—"}</p>
                <p className="text-xs text-gray-500 truncate">Therapist ID: {client.therapistId}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50/40 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Tip: Pick one reflection to bring into your next session. It helps your therapist help you.
              </p>
            </div>
          </div>

          {/* PROMPT */}
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-700">Gentle prompt</h3>
            <p className="mt-2 text-sm text-indigo-700/80">
              {lastReflection
                ? "Notice one feeling present right now. Where do you feel it in your body?"
                : "Start small: write one sentence about today."}
            </p>
          </div>

          {/* PRIVACY */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900">Privacy</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Your reflections are yours. In this demo, they are stored only in memory.
              Later, with backend, they can be securely stored and shared based on consent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition"
    >
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 truncate">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      <p className="mt-4 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition">Open →</p>
    </Link>
  );
}
