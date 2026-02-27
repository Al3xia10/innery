"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/app/_lib/authClient";

import JournalHeader from "./components/JournalHeader";
import EmptyCard from "./components/EmptyCard";
import Toast from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import ModalShell from "./components/ModalShell";
import JournalEntryCard, { Entry } from "./components/JournalEntryCard";
import { Visibility, cn, toNiceDate } from "./components/utils";

type EntryApi = any;

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
  const [toast, setToast] = useState<{ kind: "error" | "success" | "info"; message: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const DRAFT_KEY = "innery_journal_draft_v1";
  const saveTimerRef = useRef<number | null>(null);
  const [draftFound, setDraftFound] = useState(false);
  const [draftSnapshot, setDraftSnapshot] = useState<{
    title: string;
    content: string;
    tags: string;
    visibility: Visibility;
    savedAt: string;
  } | null>(null);

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

        const data = await apiFetch("/api/client/journal", { method: "GET" });
        const raw = Array.isArray(data?.entries) ? data.entries : [];

        const next: Entry[] = raw.map((e: EntryApi) => ({
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

  // Draft autosave (only for new notes, not when editing)
  useEffect(() => {
    if (!modalOpen) return;
    if (editingId != null) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        const payload = {
          title: draftTitle,
          content: draftContent,
          tags: draftTags,
          visibility: draftVisibility,
          savedAt: new Date().toISOString(),
        };
        if (payload.title.trim() || payload.content.trim() || payload.tags.trim()) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
          setDraftFound(true);
          setDraftSnapshot(payload);
        } else {
          localStorage.removeItem(DRAFT_KEY);
          setDraftFound(false);
          setDraftSnapshot(null);
        }
      } catch {}
    }, 500);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    };
  }, [modalOpen, editingId, draftTitle, draftContent, draftTags, draftVisibility]);

  // When opening the modal for a new note, check if we have a saved draft
  useEffect(() => {
    if (!modalOpen) return;
    if (editingId != null) return;

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        setDraftFound(false);
        setDraftSnapshot(null);
        return;
      }
      const parsed = JSON.parse(raw);
      const snap = {
        title: String(parsed?.title ?? ""),
        content: String(parsed?.content ?? ""),
        tags: String(parsed?.tags ?? ""),
        visibility: (parsed?.visibility === "shared" ? "shared" : "private") as Visibility,
        savedAt: String(parsed?.savedAt ?? new Date().toISOString()),
      };

      if (snap.title.trim() || snap.content.trim() || snap.tags.trim()) {
        setDraftFound(true);
        setDraftSnapshot(snap);
      } else {
        setDraftFound(false);
        setDraftSnapshot(null);
      }
    } catch {
      setDraftFound(false);
      setDraftSnapshot(null);
    }
  }, [modalOpen, editingId]);

  const restoreDraft = () => {
    if (!draftSnapshot) return;
    setDraftTitle(draftSnapshot.title);
    setDraftContent(draftSnapshot.content);
    setDraftTags(draftSnapshot.tags);
    setDraftVisibility(draftSnapshot.visibility);
    setToast({ kind: "info", message: "Am restaurat draft-ul. Poți continua în ritmul tău." });
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setDraftFound(false);
    setDraftSnapshot(null);
    setDraftTitle("");
    setDraftContent("");
    setDraftTags("");
    setDraftVisibility(tab);
    setToast({ kind: "info", message: "Ok — începem de la zero." });
  };

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
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setDraftFound(false);
      setDraftSnapshot(null);

      setModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Save entry failed", err);
      setToast({ kind: "error", message: "Nu s-a salvat. Textul tău e încă aici — încearcă din nou când ai spațiu." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry() {
    if (!editingId) return;
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!editingId) return;
    try {
      setSaving(true);
      await apiFetch(`/api/client/journal/${editingId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== editingId));
      setModalOpen(false);
      setEditingId(null);
      setToast({ kind: "success", message: "Am șters nota." });
    } catch (err) {
      console.error("Delete entry failed", err);
      setToast({ kind: "error", message: "Nu am putut șterge nota. Încearcă din nou." });
    } finally {
      setSaving(false);
      setDeleteConfirmOpen(false);
    }
  }

  const empty = filtered.length === 0;

  const onOpenEntry = (e: Entry) => {
    setEditingId(e.id);
    setDraftTitle(e.title ?? "");
    setDraftContent(e.content);
    setDraftTags(e.tags.map((t) => `#${t}`).join(", "));
    setDraftVisibility(e.visibility);
    setModalOpen(true);
  };

  return (
    <section className="relative min-h-svh">
      {toast ? <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} /> : null}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Ștergi nota?"
        message="Ștergerea nu poate fi anulată. Dacă vrei, copiază nota înainte."
        confirmText="Da, șterg"
        cancelText="Renunț"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* soft canvas */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute top-24 -right-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-7">
        <JournalHeader
          tab={tab}
          setTab={setTab}
          setSelectedTag={setSelectedTag}
          query={query}
          setQuery={setQuery}
          allTags={allTags}
          selectedTag={selectedTag}
          openNewEntry={openNewEntry}
        />

        {/* LIST */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm"
              >
                <div className="h-4 w-40 rounded bg-gray-200/60 animate-pulse" />
                <div className="mt-3 h-3 w-28 rounded bg-gray-200/60 animate-pulse" />
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200/60 animate-pulse" />
                  <div className="h-3 w-11/12 rounded bg-gray-200/60 animate-pulse" />
                  <div className="h-3 w-10/12 rounded bg-gray-200/60 animate-pulse" />
                </div>
                <div className="mt-5 flex gap-3">
                  <div className="h-10 w-28 rounded-xl bg-gray-200/60 animate-pulse" />
                  <div className="h-10 w-40 rounded-xl bg-gray-200/60 animate-pulse" />
                </div>
              </div>
            ))}
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
              <JournalEntryCard
                key={e.id}
                entry={e}
                onOpen={onOpenEntry}
                onToggleTag={(t) => setSelectedTag((prev) => (prev === t ? null : t))}
                onInfoShare={() =>
                  setToast({
                    kind: "info",
                    message:
                      "În curând vei putea împărtăși nota cu terapeutul direct de aici. Nimic nu se trimite fără acordul tău.",
                  })
                }
              />
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
        subtitle={editingId ? "Fă mici ajustări. Nota rămâne a ta." : "Scrie liber. Ține minte: nu trebuie să fie perfect."}
      >
        <div className="space-y-4">
          {editingId == null && draftFound && draftSnapshot ? (
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur p-4">
              <p className="text-sm font-semibold text-gray-900">Am găsit un draft salvat</p>
              <p className="mt-1 text-sm text-gray-600">
                Dacă vrei, poți continua de unde ai rămas. Nimic nu se pierde.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={restoreDraft}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Continui draft-ul
                </button>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                >
                  Încep de la zero
                </button>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">Salvat: {toNiceDate(draftSnapshot.savedAt)}</p>
            </div>
          ) : null}

          <div>
            <label className="text-xs font-semibold text-gray-600"></label>
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
            <p className="mt-2 text-xs text-gray-500">Tip: începe cu “Simt…” sau “Observ…”.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Simt…", "Am nevoie…", "Azi a fost greu pentru că…"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setDraftContent((prev) => {
                      const next = prev.trim() ? `${prev.replace(/\s$/g, "")}\n${p} ` : `${p} `;
                      return next;
                    });
                  }}
                  className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                >
                  {p}
                </button>
              ))}
            </div>
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
                    draftVisibility === "private" ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:bg-white"
                  )}
                >
                  Privat
                </button>
                <button
                  type="button"
                  onClick={() => setDraftVisibility("shared")}
                  className={cn(
                    "flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                    draftVisibility === "shared" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-700 hover:bg-white"
                  )}
                >
                  Pentru ședință
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Pentru ședință = o notă pe care ai putea să o aduci în discuție, dacă simți.
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