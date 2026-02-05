
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients, reflections as allReflections } from "@/app/_mock/data";
import { useClientProfile } from "@/app/_lib/profile";

type Reflection = {
  id: string;
  clientId: string;
  date: string;
  content: string;
};

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

function preview(text: string, max = 120) {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "…";
}

export default function ClientReflectionsPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params?.clientId ?? "";

  const client = React.useMemo(() => clients.find((c) => c.id === clientId), [clientId]);

  const clientProfile = useClientProfile(
    clientId,
    client?.name ?? "Client",
    (client as any)?.email ?? "client@innery.com"
  );

  const displayClientName = clientProfile?.name ?? client?.name ?? "Client";

  const seed = React.useMemo<Reflection[]>(() => {
    return (allReflections as unknown as Reflection[])
      .filter((r) => r.clientId === clientId)
      .slice()
      .sort(compareByDateDesc);
  }, [clientId]);

  const [items, setItems] = React.useState<Reflection[]>(seed);
  const [q, setQ] = React.useState("");

  // selection + editing
  const [selectedId, setSelectedId] = React.useState<string | null>(seed[0]?.id ?? null);
  const [mode, setMode] = React.useState<"view" | "edit" | "new">("view");
  const [draft, setDraft] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  // delete confirm
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    setItems(seed);
    setQ("");
    setSelectedId(seed[0]?.id ?? null);
    setMode("view");
    setDraft("");
    setSaving(false);
    setConfirmDelete(false);
  }, [seed]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((r) => {
      return (
        r.id.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query) ||
        toNiceDate(r.date).toLowerCase().includes(query)
      );
    });
  }, [items, q]);

  // keep selection valid after filtering
  React.useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (selectedId && filtered.some((r) => r.id === selectedId)) return;
    setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = React.useMemo(
    () => items.find((r) => r.id === selectedId) ?? null,
    [items, selectedId]
  );

  const selectedIndex = React.useMemo(() => {
    if (!selectedId) return -1;
    return filtered.findIndex((r) => r.id === selectedId);
  }, [filtered, selectedId]);

  function openNew() {
    setMode("new");
    setDraft("");
    // keep selected as-is until saved
  }

  function openEdit() {
    if (!selected) return;
    setMode("edit");
    setDraft(selected.content);
  }

  function cancelEdit() {
    setMode("view");
    setDraft("");
    setConfirmDelete(false);
  }

  async function save() {
    const content = draft.trim();
    if (!content) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));

    if (mode === "new") {
      const next: Reflection = {
        id: uid("r"),
        clientId,
        date: new Date().toISOString(),
        content,
      };
      setItems((prev) => [next, ...prev]);
      setSelectedId(next.id);
    }

    if (mode === "edit" && selected) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? {
                ...r,
                content,
                // keep original date; you can change to new Date() if you want "edited at"
              }
            : r
        )
      );
    }

    setMode("view");
    setDraft("");
    setSaving(false);
  }

  function goPrev() {
    if (selectedIndex <= 0) return;
    setMode("view");
    setDraft("");
    setSelectedId(filtered[selectedIndex - 1].id);
  }

  function goNext() {
    if (selectedIndex < 0 || selectedIndex >= filtered.length - 1) return;
    setMode("view");
    setDraft("");
    setSelectedId(filtered[selectedIndex + 1].id);
  }

  function requestDelete() {
    if (!selected) return;
    setConfirmDelete(true);
  }

  async function confirmDeleteNow() {
    if (!selected) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));

    const toDeleteId = selected.id;
    setItems((prev) => prev.filter((r) => r.id !== toDeleteId));

    // update selection to neighbor in filtered
    const idx = filtered.findIndex((r) => r.id === toDeleteId);
    const next = filtered[idx + 1] ?? filtered[idx - 1] ?? null;
    setSelectedId(next?.id ?? null);

    setConfirmDelete(false);
    setMode("view");
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Reflections
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Your reflections</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            Private notes for your therapy journey (demo: saved in-memory).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/client/${clientId}`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            New reflection
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: LIST */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search reflections…"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-4 space-y-2 max-h-130 overflow-auto pr-1">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                  <p className="text-sm font-semibold text-gray-900">No reflections</p>
                  <p className="mt-1 text-sm text-gray-600">Create your first reflection.</p>
                  <button
                    type="button"
                    onClick={openNew}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
                  >
                    New reflection
                  </button>
                </div>
              ) : (
                filtered.map((r) => {
                  const active = r.id === selectedId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(r.id);
                        setMode("view");
                        setDraft("");
                        setConfirmDelete(false);
                      }}
                      className={
                        "w-full text-left rounded-2xl border p-4 transition " +
                        (active
                          ? "border-indigo-200 bg-indigo-50"
                          : "border-gray-100 bg-white hover:bg-gray-50")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-gray-600">{toNiceDate(r.date)}</p>
                        {active ? (
                          <span className="text-[11px] font-semibold text-indigo-700">Selected</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{preview(r.content, 44)}</p>
                      <p className="mt-1 text-xs text-gray-500">{preview(r.content, 80)}</p>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              {filtered.length} shown • {items.length} total
            </div>
          </div>
        </aside>

        {/* RIGHT: DETAILS */}
        <main className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {/* top bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                  {displayClientName
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayClientName}</p>
                  <p className="text-xs text-gray-500 truncate">Client ID: {clientId}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={mode !== "view" || selectedIndex <= 0}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={mode !== "view" || selectedIndex < 0 || selectedIndex >= filtered.length - 1}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>

                <span className="mx-1 hidden sm:inline text-sm text-gray-300">|</span>

                <button
                  type="button"
                  onClick={openNew}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  New
                </button>

                <button
                  type="button"
                  onClick={openEdit}
                  disabled={!selected || mode !== "view"}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={requestDelete}
                  disabled={!selected || mode !== "view"}
                  className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-6">
              {mode === "new" ? (
                <div>
                  <p className="text-xs font-semibold text-gray-500">New reflection</p>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write freely…"
                    className="mt-3 w-full min-h-70 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-gray-500">Demo mode • saved in-memory • refresh resets</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={save}
                        disabled={!draft.trim() || saving}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:opacity-50 transition"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : mode === "edit" ? (
                <div>
                  <p className="text-xs font-semibold text-gray-500">Editing</p>
                  <p className="mt-2 text-xs text-gray-500">{selected ? toNiceDate(selected.date) : "—"}</p>

                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="mt-3 w-full min-h-70 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">Changes are in-memory (demo).</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={save}
                        disabled={!draft.trim() || saving}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:opacity-50 transition"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {!selected ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                      <p className="text-sm font-semibold text-gray-900">No reflection selected</p>
                      <p className="mt-1 text-sm text-gray-600">Pick one from the list or create a new reflection.</p>
                      <button
                        type="button"
                        onClick={openNew}
                        className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition"
                      >
                        New reflection
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{toNiceDate(selected.date)}</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">Reflection</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">#{selectedIndex + 1} of {filtered.length}</span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                        <p className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                          {selected.content}
                        </p>
                      </div>

                      {confirmDelete ? (
                        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                          <p className="text-sm font-semibold text-rose-800">Delete this reflection?</p>
                          <p className="mt-1 text-sm text-rose-800/80">This action can’t be undone (demo).</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition"
                            >
                              Keep
                            </button>
                            <button
                              type="button"
                              onClick={confirmDeleteNow}
                              disabled={saving}
                              className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
                            >
                              {saving ? "Deleting…" : "Delete"}
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
