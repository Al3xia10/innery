"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients, therapists, reflections as allReflections } from "@/app/_mock/data";
import { useClientProfile, useTherapistProfile } from "@/app/_lib/profile";

type ClientNote = {
  id: string;
  clientId: string;
  therapistId: string;
  date: string; // ISO
  title: string;
  content: string;
  shared: boolean; // in the future: consent-controlled sharing
};

type Reflection = {
  id: string;
  clientId: string;
  date: string;
  content: string;
};

function uid(prefix = "n") {
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

function preview(text: string, max = 90) {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "…";
}

function storageKey(clientId: string) {
  return `innery_client_notes_${clientId}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function ClientNotesPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params?.clientId ?? "";

  const client = React.useMemo(() => clients.find((c) => c.id === clientId), [clientId]);
  const therapist = React.useMemo(
    () => therapists.find((t) => t.id === client?.therapistId),
    [client?.therapistId]
  );

  const clientProfile = useClientProfile(
    clientId,
    client?.name ?? "Client",
    (client as any)?.email ?? "client@innery.com"
  );

  const therapistProfile = useTherapistProfile(
    client?.therapistId ?? "",
    therapist?.name ?? "Therapist",
    (therapist as any)?.email ?? "therapist@innery.com"
  );

  const displayClientName = clientProfile?.name ?? client?.name ?? "Client";
  const displayTherapistName = therapistProfile?.name ?? therapist?.name ?? (client?.therapistId ?? "Therapist");

  // Seed from reflections for a nicer first experience (only if localStorage is empty).
  const reflectionSeed = React.useMemo(() => {
    const refl = (allReflections as unknown as Reflection[])
      .filter((r) => r.clientId === clientId)
      .slice()
      .sort(compareByDateDesc);

    return refl.slice(0, 3).map<ClientNote>((r, i) => ({
      id: uid("seed"),
      clientId,
      therapistId: client?.therapistId ?? "t1",
      date: r.date,
      title: i === 0 ? "What I want to explore" : i === 1 ? "What I noticed" : "What I need support with",
      content: r.content,
      shared: false,
    }));
  }, [clientId, client?.therapistId]);

  const [hydrated, setHydrated] = React.useState(false);
  const [items, setItems] = React.useState<ClientNote[]>([]);
  const [q, setQ] = React.useState("");

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"view" | "new" | "edit">("view");
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftContent, setDraftContent] = React.useState("");
  const [draftShared, setDraftShared] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Hydrate from localStorage
  React.useEffect(() => {
    if (!clientId) return;

    const key = storageKey(clientId);
    const existing = safeParse<ClientNote[]>(localStorage.getItem(key));

    if (existing && Array.isArray(existing) && existing.length > 0) {
      const sorted = existing.slice().sort(compareByDateDesc);
      setItems(sorted);
      setSelectedId(sorted[0]?.id ?? null);
    } else {
      const seeded = reflectionSeed.slice().sort(compareByDateDesc);
      setItems(seeded);
      setSelectedId(seeded[0]?.id ?? null);
      localStorage.setItem(key, JSON.stringify(seeded));
    }

    setHydrated(true);
  }, [clientId, reflectionSeed]);

  // Persist
  React.useEffect(() => {
    if (!hydrated || !clientId) return;
    localStorage.setItem(storageKey(clientId), JSON.stringify(items));
  }, [items, hydrated, clientId]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((n) => {
      return (
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        toNiceDate(n.date).toLowerCase().includes(query) ||
        (n.shared ? "shared" : "private").includes(query)
      );
    });
  }, [items, q]);

  // keep selection valid after filtering
  React.useEffect(() => {
    if (!hydrated) return;
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (selectedId && filtered.some((x) => x.id === selectedId)) return;
    setSelectedId(filtered[0].id);
  }, [filtered, selectedId, hydrated]);

  const selected = React.useMemo(
    () => items.find((n) => n.id === selectedId) ?? null,
    [items, selectedId]
  );

  const selectedIndex = React.useMemo(() => {
    if (!selectedId) return -1;
    return filtered.findIndex((n) => n.id === selectedId);
  }, [filtered, selectedId]);

  function openNew() {
    setMode("new");
    setConfirmDelete(false);
    setDraftTitle("");
    setDraftContent("");
    setDraftShared(false);
  }

  function openEdit() {
    if (!selected) return;
    setMode("edit");
    setConfirmDelete(false);
    setDraftTitle(selected.title);
    setDraftContent(selected.content);
    setDraftShared(selected.shared);
  }

  function cancel() {
    setMode("view");
    setConfirmDelete(false);
    setDraftTitle("");
    setDraftContent("");
    setDraftShared(false);
  }

  async function save() {
    const title = draftTitle.trim() || "Untitled";
    const content = draftContent.trim();
    if (!content) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 220));

    if (mode === "new") {
      const next: ClientNote = {
        id: uid("n"),
        clientId,
        therapistId: client?.therapistId ?? "t1",
        date: new Date().toISOString(),
        title,
        content,
        shared: draftShared,
      };
      setItems((prev) => [next, ...prev]);
      setSelectedId(next.id);
    }

    if (mode === "edit" && selected) {
      setItems((prev) =>
        prev.map((n) =>
          n.id === selected.id
            ? {
                ...n,
                title,
                content,
                shared: draftShared,
              }
            : n
        )
      );
    }

    setMode("view");
    setDraftTitle("");
    setDraftContent("");
    setDraftShared(false);
    setSaving(false);
  }

  function goPrev() {
    if (mode !== "view") return;
    if (selectedIndex <= 0) return;
    setSelectedId(filtered[selectedIndex - 1].id);
  }

  function goNext() {
    if (mode !== "view") return;
    if (selectedIndex < 0 || selectedIndex >= filtered.length - 1) return;
    setSelectedId(filtered[selectedIndex + 1].id);
  }

  function requestDelete() {
    if (!selected || mode !== "view") return;
    setConfirmDelete(true);
  }

  async function confirmDeleteNow() {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 180));

    const toDeleteId = selected.id;
    setItems((prev) => prev.filter((n) => n.id !== toDeleteId));

    const idx = filtered.findIndex((n) => n.id === toDeleteId);
    const next = filtered[idx + 1] ?? filtered[idx - 1] ?? null;
    setSelectedId(next?.id ?? null);

    setConfirmDelete(false);
    setSaving(false);
  }

  if (!client) {
    return (
      <section className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="rounded-[20px] border border-dashed border-gray-200 bg-white p-6 text-center sm:rounded-[28px] sm:p-10">
          <h1 className="text-base font-semibold text-gray-900">Client inexistent</h1>
          <p className="mt-2 text-sm leading-6 sm:leading-7 text-gray-600">Verifică URL-ul. Aceasta este o rută demo.</p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Mergi acasă
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[18px] bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 sm:rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Notițe
          </div>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight text-gray-900 sm:text-2xl">Notesle mele</h1>
          <p className="mt-1 max-w-xl text-sm leading-6 sm:leading-7 text-gray-600">
            Notițe pe care le poți păstra private sau le poți partaja cu terapeutul atunci când simți că e momentul.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link
            href={`/client/${clientId}`}
            className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Înapoi la dashboard
          </Link>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            Notiță nouă
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* LEFT: LIST */}
        <aside className="lg:col-span-1">
          <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[28px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Caută în notițe…"
              className="w-full rounded-[18px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="mt-4 space-y-2 max-h-130 overflow-auto pr-1">
              {filtered.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-gray-200 p-5 text-center sm:rounded-[28px] sm:p-6">
                  <p className="text-sm font-semibold text-gray-900">Nu există notițe</p>
                  <p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">Creează prima ta notiță.</p>
                  <button
                    type="button"
                    onClick={openNew}
                    className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    Notiță nouă
                  </button>
                </div>
              ) : (
                filtered.map((n) => {
                  const active = n.id === selectedId;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(n.id);
                        setMode("view");
                        setConfirmDelete(false);
                        setDraftTitle("");
                        setDraftContent("");
                        setDraftShared(false);
                      }}
                      className={
                        "w-full text-left rounded-[20px] border p-4 transition sm:rounded-[28px] " +
                        (active
                          ? "border-indigo-200 bg-indigo-50"
                          : "border-gray-100 bg-white hover:bg-gray-50")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-gray-600">{toNiceDate(n.date)}</p>
                        <span
                          className={
                            "text-[11px] font-semibold " +
                            (n.shared ? "text-indigo-700" : "text-gray-500")
                          }
                        >
                          {n.shared ? "Partajată" : "Privată"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{preview(n.content)}</p>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              {filtered.length} afișate • {items.length} total
            </div>
          </div>
        </aside>

        {/* RIGHT: DETAILS */}
        <main className="lg:col-span-2">
          <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            {/* top bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-indigo-50 font-semibold text-indigo-700 sm:rounded-full">
                  {displayClientName
                    .split(" ")
                    .filter(Boolean)
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayClientName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    Terapeut: {displayTherapistName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={mode !== "view" || selectedIndex <= 0}
                  className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={mode !== "view" || selectedIndex < 0 || selectedIndex >= filtered.length - 1}
                  className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Următor
                </button>

                <span className="mx-1 hidden sm:inline text-sm text-gray-300">|</span>

                <button
                  type="button"
                  onClick={openNew}
                  className="inline-flex min-h-10 items-center justify-center rounded-[18px] bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                >
                  Nouă
                </button>

                <button
                  type="button"
                  onClick={openEdit}
                  disabled={!selected || mode !== "view"}
                  className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Editează
                </button>

                <button
                  type="button"
                  onClick={requestDelete}
                  disabled={!selected || mode !== "view"}
                  className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-50"
                >
                  Șterge
                </button>
              </div>
            </div>

            <div className="mt-6">
              {mode === "new" || mode === "edit" ? (
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    {mode === "new" ? "Notiță nouă" : "Editezi notița"}
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Titlu"
                      className="w-full rounded-[18px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <label className="flex items-center gap-2 rounded-[18px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm">
                      <input
                        type="checkbox"
                        checked={draftShared}
                        onChange={(e) => setDraftShared(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Partajează cu terapeutul
                    </label>
                  </div>

                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="Scrie notița ta…"
                    className="mt-3 w-full min-h-80 rounded-[20px] border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:rounded-[28px]"
                  />

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">Salvat în localStorage (demo) • rămâne după refresh.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancel}
                        className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                      >
                        Anulează
                      </button>
                      <button
                        type="button"
                        onClick={save}
                        disabled={!draftContent.trim() || saving}
                        className="inline-flex min-h-10 items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-50"
                      >
                        {saving ? "Se salvează…" : "Salveaza"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {!selected ? (
                    <div className="rounded-[20px] border border-dashed border-gray-200 p-6 text-center sm:rounded-[28px] sm:p-10">
                      <p className="text-sm font-semibold text-gray-900">Nicio notiță selectată</p>
                      <p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">Alege una din listă sau creează o notiță nouă.</p>
                      <button
                        type="button"
                        onClick={openNew}
                        className="mt-5 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                      >
                        Notiță nouă
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{toNiceDate(selected.date)}</p>
                          <h2 className="mt-2 text-xl font-semibold text-gray-900">{selected.title}</h2>
                          <div className="mt-2 inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-100">
                            {selected.shared ? "Partajată cu terapeutul" : "Privată"}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">#{selectedIndex + 1} of {filtered.length}</span>
                      </div>

                      <div className="mt-5 rounded-[20px] border border-gray-100 bg-gray-50/40 p-4 sm:rounded-[28px] sm:p-5">
                        <p className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">{selected.content}</p>
                      </div>

                      {confirmDelete ? (
                        <div className="mt-5 rounded-[20px] border border-rose-200 bg-rose-50 p-4 sm:rounded-[28px]">
                          <p className="text-sm font-semibold text-rose-800">Ștergi această notiță?</p>
                          <p className="mt-1 text-sm leading-6 text-rose-800/80">Această acțiune nu poate fi anulată.</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              Păstrează
                            </button>
                            <button
                              type="button"
                              onClick={confirmDeleteNow}
                              disabled={saving}
                              className="inline-flex min-h-10 items-center justify-center rounded-[18px] bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                            >
                              {saving ? "Se șterge…" : "Sterge"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}