"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/_lib/authClient";

type Visibility = "private" | "shared";

type Entry = {
  id: number;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  title: string | null;
  content: string;
  tags: string[];
  visibility: Visibility;
  preparedForSession: boolean;
  preparedAt: string | null;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
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

function TagChip({ tag, active, onClick }: { tag: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-800"
          : "border-white/60 bg-white/70 text-gray-700 hover:bg-white hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      )}
    >
      {tag === "all" ? "Toate" : `#${tag}`}
    </button>
  );
}

function EmptyCard({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/70 bg-white/60 backdrop-blur-xl p-6 sm:p-7 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      <div className="mt-4">{cta}</div>
    </div>
  );
}

function ModalShell({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // focus first input for accessibility
    const first = panelRef.current?.querySelector<HTMLInputElement>("input, textarea, button");
    first?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-xl rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Închide
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [tab, setTab] = useState<Visibility>("private");
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // draft fields
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftVisibility, setDraftVisibility] = useState<Visibility>("private");

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Load entries from backend
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // Expected response shape: { entries: [...] }
        const data = await apiFetch("/api/client/journal", { method: "GET" });
        const raw = Array.isArray(data?.entries) ? data.entries : [];

        const next: Entry[] = raw.map((e: any) => ({
          id: Number(e.id),
          createdAt: String(e.createdAt ?? e.created_at ?? new Date().toISOString()),
          updatedAt: e.updatedAt ? String(e.updatedAt) : e.updated_at ? String(e.updated_at) : undefined,
          title: e.title == null ? null : String(e.title),
          content: String(e.content ?? ""),
          tags: Array.isArray(e.tags)
            ? e.tags.map((t: any) => String(t).trim().replace(/^#/, "")).filter(Boolean)
            : typeof e.tags === "string"
              ? e.tags
                  .split(",")
                  .map((t: string) => t.trim().replace(/^#/, ""))
                  .filter(Boolean)
              : [],
          visibility: (e.visibility === "shared" ? "shared" : "private") as Visibility,
          preparedForSession:
            typeof e.preparedForSession === "boolean"
              ? e.preparedForSession
              : typeof e.prepared_for_session === "boolean"
                ? e.prepared_for_session
                : Boolean(e.prepared_for_session),
          preparedAt: e.preparedAt ? String(e.preparedAt) : e.prepared_at ? String(e.prepared_at) : null,
        }));

        if (alive) setEntries(next);
      } catch (err: any) {
        console.error("Failed to load journal entries", err);
        if (alive) setLoadError("Nu am putut încărca jurnalul. Încearcă din nou.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const visibleEntries = useMemo(() => entries.filter((e) => e.visibility === tab), [entries, tab]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const e of visibleEntries) for (const t of e.tags) s.add(t);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [visibleEntries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleEntries
      .filter((e) => {
        if (selectedTag && !e.tags.includes(selectedTag)) return false;
        if (!q) return true;
        return (
          (e.title?.toLowerCase().includes(q)) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [visibleEntries, query, selectedTag]);

  function openNewEntry() {
    setEditingId(null);
    setDraftTitle("");
    setDraftContent("");
    setDraftTags("");
    setDraftVisibility(tab);
    setModalOpen(true);
  }

  async function saveEntry() {
    if (!draftContent.trim() && !draftTitle.trim()) return;

    setSaving(true);

    const tags = draftTags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 8);

    const payload = {
      title: draftTitle.trim() ? draftTitle.trim() : null,
      content: draftContent.trim(),
      tags,
      visibility: draftVisibility,
    };

    try {
      if (editingId != null) {
        // Expected response: { entry: {...} }
        const data = await apiFetch(`/api/client/journal/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const saved = data?.entry ?? data;

        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingId
              ? {
                  ...e,
                  title: saved?.title == null ? payload.title : String(saved?.title),
                  content: String(saved?.content ?? payload.content),
                  tags: Array.isArray(saved?.tags) ? saved.tags : payload.tags,
                  visibility: (saved?.visibility === "shared" ? "shared" : "private") as Visibility,
                  createdAt: String(saved?.createdAt ?? e.createdAt),
                  updatedAt: saved?.updatedAt ? String(saved.updatedAt) : e.updatedAt,
                  preparedForSession:
                    typeof saved?.preparedForSession === "boolean" ? saved.preparedForSession : e.preparedForSession,
                  preparedAt:
                    saved?.preparedAt ? String(saved.preparedAt) : saved?.prepared_at ? String(saved.prepared_at) : e.preparedAt,
                }
              : e
          )
        );
      } else {
        // Expected response: { entry: {...} }
        const data = await apiFetch("/api/client/journal", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const saved = data?.entry ?? data;

        const next: Entry = {
          id: Number(saved?.id),
          createdAt: String(saved?.createdAt ?? new Date().toISOString()),
          updatedAt: saved?.updatedAt ? String(saved.updatedAt) : undefined,
          title: saved?.title == null ? payload.title : String(saved?.title),
          content: String(saved?.content ?? payload.content),
          tags: Array.isArray(saved?.tags) ? saved.tags : payload.tags,
          visibility: (saved?.visibility === "shared" ? "shared" : "private") as Visibility,
          preparedForSession: Boolean(saved?.preparedForSession ?? false),
          preparedAt: saved?.preparedAt ? String(saved.preparedAt) : null,
        };

        setEntries((prev) => [next, ...prev]);
      }

      setModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Save entry failed", err);
      // keep modal open so user doesn't lose text
      alert("Nu am putut salva nota. Verifică conexiunea și încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry() {
    if (!editingId) return;

    const ok = confirm("Ștergi nota? Acțiunea nu poate fi anulată.");
    if (!ok) return;

    try {
      setSaving(true);
      await apiFetch(`/api/client/journal/${editingId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== editingId));
      setModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Delete entry failed", err);
      alert("Nu am putut șterge nota. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePrepared(entry: Entry) {
    try {
      const nextPrepared = !entry.preparedForSession;
      const data = await apiFetch(`/api/client/journal/${entry.id}/prepare`, {
        method: "POST",
        body: JSON.stringify({ prepared: nextPrepared }),
      });

      const saved = data?.entry ?? data;

      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                preparedForSession:
                  typeof saved?.preparedForSession === "boolean"
                    ? saved.preparedForSession
                    : nextPrepared,
                preparedAt: saved?.preparedAt
                  ? String(saved.preparedAt)
                  : saved?.prepared_at
                    ? String(saved.prepared_at)
                    : nextPrepared
                      ? new Date().toISOString()
                      : null,
                updatedAt: saved?.updatedAt ? String(saved.updatedAt) : e.updatedAt,
              }
            : e
        )
      );
    } catch (err) {
      console.error("Toggle prepared failed", err);
      alert("Nu am putut actualiza statusul. Încearcă din nou.");
    }
  }

  const empty = filtered.length === 0;

  return (
    <section className="relative min-h-svh">
      {/* soft canvas */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute top-24 -right-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-7">
        {/* HEADER */}
        <header className="rounded-4xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <div className="relative px-6 py-7 sm:px-10 sm:py-10">
            <div className="absolute inset-0 bg-linear-to-br from-white/50 to-white/10" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Spațiul tău de jurnal
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900">
                  Jurnalul tău, în ritmul tău
                </h1>
                <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                  Scrie ca să te auzi. Păstrează privat sau împărtășește cu terapeutul când simți.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={openNewEntry}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                >
                  Scrie în jurnal
                </button>
                <Link
                  href="/client"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                >
                  Înapoi la Azi
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="relative mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="inline-flex items-center rounded-full border border-white/60 bg-white/70 backdrop-blur p-1 shadow-sm w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setTab("private");
                    setSelectedTag(null);
                  }}
                  className={cn(
                    "flex-1 sm:flex-none rounded-full px-3 py-2 text-xs font-semibold transition",
                    tab === "private"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-white"
                  )}
                >
                  Privat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("shared");
                    setSelectedTag(null);
                  }}
                  className={cn(
                    "flex-1 sm:flex-none rounded-full px-3 py-2 text-xs font-semibold transition",
                    tab === "shared"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-white"
                  )}
                >
                  Pentru ședință
                </button>
              </div>

              <div className="text-xs text-gray-600">
                {tab === "private" ? (
                  <span>
                    Privat: doar pentru tine. Nimeni nu vede fără acordul tău.
                  </span>
                ) : (
                  <span>
                    Pentru ședință: note pe care alegi să le trimiți terapeutului (curând).
                  </span>
                )}
              </div>
            </div>
            {/* SEARCH & TAGS */}
            <div className="relative mt-4 flex flex-col gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută în jurnal…"
                className="w-full sm:max-w-md rounded-full border border-white/60 bg-white/80 px-5 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Caută în jurnal"
              />

              {/* tags */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {allTags.length === 0 ? (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Tag-urile apar după ce adaugi câteva note.
                  </span>
                ) : (
                  <>
                    <TagChip tag="all" active={selectedTag == null} onClick={() => setSelectedTag(null)} />
                    {allTags.map((t) => (
                      <TagChip
                        key={t}
                        tag={t}
                        active={selectedTag === t}
                        onClick={() => setSelectedTag((prev) => (prev === t ? null : t))}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </header>



        {/* LIST */}
        {loading ? (
          <div className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Se încarcă jurnalul…</p>
            <p className="mt-1 text-sm text-gray-600">Un moment.</p>
          </div>
        ) : loadError ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50/70 backdrop-blur-xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-rose-800">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition"
            >
              Reîncarcă pagina
            </button>
          </div>
        ) : null}
        {selectedTag && (
          <div className="flex items-center justify-between text-xs text-gray-600 px-2">
            <span>
              Filtrat după: <span className="font-semibold text-gray-900">#{selectedTag}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Șterge filtrul
            </button>
          </div>
        )}
        {empty ? (
          <EmptyCard
            title={tab === "private" ? "Nu ai încă note private" : "Nu ai încă note pentru ședință"}
            subtitle={
              tab === "private"
                ? "Începe cu un paragraf mic. Poate fi doar o propoziție despre azi."
                : "Alege o notă pe care ai vrea să o discuți în ședință."
            }
            cta={
              <button
                type="button"
                onClick={openNewEntry}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
              >
                Scrie prima notă
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((e) => (
              <article
                key={e.id}
                className={cn(
                  "relative overflow-hidden rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                  e.visibility === "private"
                    ? "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-linear-to-b before:from-gray-300 before:to-transparent before:content-['']"
                    : "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-linear-to-b before:from-indigo-400 before:to-transparent before:content-['']"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{e.title ?? "Fără titlu"}</h3>
                    <p className="mt-1 text-xs text-gray-500">{toNiceDate(e.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm",
                      e.visibility === "private"
                        ? "border-gray-100 bg-gray-50 text-gray-800"
                        : "border-indigo-100 bg-indigo-50 text-indigo-800"
                    )}
                  >
                    {e.visibility === "private" ? "Privat" : "Pentru ședință"}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-700 leading-relaxed line-clamp-5">
                  {e.content}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {e.tags.length === 0 ? (
                    <span className="text-xs text-gray-400">fără tag-uri</span>
                  ) : (
                    e.tags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setSelectedTag((prev) => (prev === t ? null : t))
                        }
                        className="rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                      >
                        #{t}
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(e.id);
                      // For now: simple “open” behavior = open modal prefilled (future: dedicated entry page)
                      setDraftTitle(e.title ?? "");
                      setDraftContent(e.content);
                      setDraftTags(e.tags.map((t) => `#${t}`).join(", "));
                      setDraftVisibility(e.visibility);
                      setModalOpen(true);
                    }}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                  >
                    Deschide
                  </button>

                  {e.visibility === "shared" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => togglePrepared(e)}
                        className={cn(
                          "inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition",
                          e.preparedForSession
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border border-white/60 bg-white/70 text-gray-800"
                        )}
                      >
                        {e.preparedForSession ? "Pregătită pentru ședință" : "Pregătește pentru ședință"}
                      </button>

                      <button
                        type="button"
                        disabled={!e.preparedForSession}
                        className={cn(
                          "inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                          !e.preparedForSession
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                        )}
                        onClick={() => {
                          // urmează pasul următor: trimitere către terapeut (când avem endpoint dedicat)
                          alert("Perfect. În curând vei putea trimite nota către terapeut, direct de aici.");
                        }}
                      >
                        Trimite terapeutului
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <ModalShell
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSaving(false);
          setEditingId(null);
          setDraftVisibility(tab);
        }}
        title={editingId ? "Editează nota" : "Scrie în jurnal"}
        subtitle={editingId ? "Fă mici ajustări. Nota rămâne a ta." : "Scrie liber. Nu trebuie să fie perfect."}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Titlu</label>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Ex: Azi am observat…"
              className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Conținut</label>
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Scrie liber. 3–5 rânduri sunt suficiente."
              className="mt-2 w-full min-h-40 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Tip: începe cu “Simt…” sau “Observ…”.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Tags</label>
              <input
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                placeholder="#anxietate, #somn, #relații"
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-2 text-xs text-gray-500">Separate prin virgulă.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Vizibilitate</label>
              <div className="mt-2 inline-flex w-full items-center rounded-2xl border border-white/60 bg-white/70 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setDraftVisibility("private")}
                  className={cn(
                    "flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                    draftVisibility === "private"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-700 hover:bg-white"
                  )}
                >
                  Privat
                </button>
                <button
                  type="button"
                  onClick={() => setDraftVisibility("shared")}
                  className={cn(
                    "flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                    draftVisibility === "shared"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-white"
                  )}
                >
                  Pentru ședință
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Pentru ședință = pregătită să o discuți în ședință (curând).
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={saveEntry}
              disabled={saving || (!draftTitle.trim() && !draftContent.trim())}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition disabled:opacity-50"
            >
              {saving ? "Se salvează…" : editingId ? "Salvează modificările" : "Salvează nota"}
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={deleteEntry}
                disabled={saving}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition disabled:opacity-50"
              >
                Șterge
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Renunță
            </button>
          </div>
        </div>
      </ModalShell>
    </section>
  );
}