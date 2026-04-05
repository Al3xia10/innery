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
  const sessionStartedWithStoredDraftRef = useRef(false);
  const [draftFound, setDraftFound] = useState(false);
  const [draftSnapshot, setDraftSnapshot] = useState<{
    title: string;
    content: string;
    tags: string;
    visibility: Visibility;
    savedAt: string;
  } | null>(null);

  const [editorFocused, setEditorFocused] = useState(false);
  const [draftSaveState, setDraftSaveState] = useState<"idle" | "saving" | "saved">("idle");

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
    let storedDraft: {
      title: string;
      content: string;
      tags: string;
      visibility: Visibility;
      savedAt: string;
    } | null = null;

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const snap = {
          title: String(parsed?.title ?? ""),
          content: String(parsed?.content ?? ""),
          tags: String(parsed?.tags ?? ""),
          visibility: (parsed?.visibility === "shared" ? "shared" : "private") as Visibility,
          savedAt: String(parsed?.savedAt ?? new Date().toISOString()),
        };

        if (snap.title.trim() || snap.content.trim() || snap.tags.trim()) {
          storedDraft = snap;
        }
      }
    } catch {}

    sessionStartedWithStoredDraftRef.current = Boolean(storedDraft);
    setDraftFound(Boolean(storedDraft));
    setDraftSnapshot(storedDraft);
    setEditingId(null);
    setDraftTitle("");
    setDraftContent("");
    setDraftTags("");
    setDraftVisibility(storedDraft ? storedDraft.visibility : tab);
    setModalOpen(true);
    setEditorFocused(false);
    setDraftSaveState("idle");
  }

  // Draft autosave (only for new notes, not when editing)
useEffect(() => {
  if (!modalOpen) {
    setDraftSaveState("idle");
    return;
  }
  if (editingId != null) {
    setDraftSaveState("idle");
    return;
  }

  if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

  const hasDraftContent = Boolean(draftTitle.trim() || draftContent.trim() || draftTags.trim());
if (!hasDraftContent) {
  // Dacă sesiunea a început cu un draft deja salvat, nu-l ștergem automat.
  // Îl păstrăm până când utilizatorul alege explicit:
  // restore, discard sau save.
  if (sessionStartedWithStoredDraftRef.current) {
    setDraftFound(true);
    setDraftSaveState("idle");
    return;
  }

  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
  setDraftSnapshot(null);
  setDraftFound(false);
  setDraftSaveState("idle");
  return;
}

  setDraftSaveState("saving");

  saveTimerRef.current = window.setTimeout(() => {
    try {
      const payload = {
        title: draftTitle,
        content: draftContent,
        tags: draftTags,
        visibility: draftVisibility,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSnapshot(payload);
      setDraftSaveState("saved");
    } catch {
      setDraftSaveState("idle");
    }
  }, 500);

  return () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
  };
}, [modalOpen, editingId, draftTitle, draftContent, draftTags, draftVisibility]);

  // Only when opening the editor, check if a previously unfinished draft already exists in storage.
  // This banner should reflect an older unfinished note, not the draft created during the current session.
useEffect(() => {
  if (!modalOpen) {
    sessionStartedWithStoredDraftRef.current = false;
    return;
  }
  if (editingId != null) {
    sessionStartedWithStoredDraftRef.current = false;
    setDraftFound(false);
    setDraftSnapshot(null);
    return;
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      sessionStartedWithStoredDraftRef.current = false;
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

    const hasStoredDraft = Boolean(snap.title.trim() || snap.content.trim() || snap.tags.trim());
    sessionStartedWithStoredDraftRef.current = hasStoredDraft;
    setDraftFound(hasStoredDraft);
    setDraftSnapshot(hasStoredDraft ? snap : null);
    if (hasStoredDraft) {
      setDraftVisibility(snap.visibility);
    }
  } catch {
    sessionStartedWithStoredDraftRef.current = false;
    setDraftFound(false);
    setDraftSnapshot(null);
  }
}, [modalOpen, editingId]);

  const restoreDraft = () => {
  if (!draftSnapshot) return;
  sessionStartedWithStoredDraftRef.current = false;
  setDraftTitle(draftSnapshot.title);
  setDraftContent(draftSnapshot.content);
  setDraftTags(draftSnapshot.tags);
  setDraftVisibility(draftSnapshot.visibility);
  setDraftFound(false);
  setDraftSaveState("saved");
  setToast({ kind: "info", message: "Am restaurat draft-ul. Poți continua în ritmul tău." });
};

  const discardDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
  sessionStartedWithStoredDraftRef.current = false;
  setDraftFound(false);
  setDraftSnapshot(null);
  setDraftTitle("");
  setDraftContent("");
  setDraftTags("");
  setDraftVisibility(tab);
  setDraftSaveState("idle");
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

      sessionStartedWithStoredDraftRef.current = false;
      setModalOpen(false);
      setEditingId(null);
      setEditorFocused(false);
setDraftSaveState("idle");
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
        {modalOpen ? (
          <div className="space-y-4">
            <ModalShell
              open={modalOpen}
              onClose={() => {
                setModalOpen(false);
                setSaving(false);
                setEditingId(null);
                setEditorFocused(false);
                setDraftSaveState("idle");
              }}
              title={editingId ? "Editează nota" : "Scrie în jurnal"}
              subtitle={editingId ? "Fă mici ajustări. Nota rămâne a ta." : "Scrie liber. Ține minte: nu trebuie să fie perfect."}
            >
              <div className="space-y-5">
                {editingId == null && draftFound && draftSnapshot ? (
                  <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-[0_8px_20px_rgba(31,23,32,0.04)] backdrop-blur-sm sm:p-5">
                    <p className="text-sm font-semibold text-[#1f1720]">Am găsit un draft salvat</p>
                    <p className="mt-1 text-sm leading-7 text-[#6B5A63]">
                      Dacă vrei, poți continua de unde ai rămas. Nimic nu se pierde.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={restoreDraft}
                        className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] transition hover:opacity-95"
                      >
                        Continui draft-ul
                      </button>
                      <button
                        type="button"
                        onClick={discardDraft}
                        className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1720] shadow-[0_6px_14px_rgba(31,23,32,0.06)] transition hover:bg-black/5"
                      >
                        Încep de la zero
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-[#6B5A63]">Salvat: {toNiceDate(draftSnapshot.savedAt)}</p>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-3xl border border-black/5 bg-white/88 p-3.5 shadow-[0_8px_20px_rgba(31,23,32,0.04)] transition sm:p-4",
                    editorFocused && "opacity-55"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d5d6c]">
                      Vizibilitate
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[#6B5A63]">
                      {draftVisibility === "private"
                        ? "Doar tu vezi această notiță."
                        : "O poți păstra pentru ședință, dacă simți."}
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center rounded-full border border-black/5 bg-[#fcf9fb] p-1.5 shadow-[0_6px_14px_rgba(31,23,32,0.04)]">
                    <button
                      type="button"
                      onClick={() => setDraftVisibility("private")}
                      className={cn(
                        "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                        draftVisibility === "private"
                          ? "bg-white text-[#1f1720] shadow-[0_6px_14px_rgba(31,23,32,0.06)]"
                          : "bg-transparent text-[#6B5A63] hover:text-[#1f1720]"
                      )}
                    >
                      🔒 Privat
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftVisibility("shared")}
                      className={cn(
                        "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                        draftVisibility === "shared"
                          ? "bg-(--color-accent) text-white shadow-[0_10px_18px_rgba(239,135,192,0.18)]"
                          : "bg-transparent text-[#6B5A63] hover:text-[#1f1720]"
                      )}
                    >
                      🤝 Pentru ședință
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  onFocus={() => setEditorFocused(true)}
                  onBlur={() => setEditorFocused(false)}
                  placeholder="Scrie liber aici. Nu trebuie să iasă perfect."
                  className={cn(
                    "min-h-35 w-full rounded-[26px] border border-[#ead7df] bg-white px-5 py-4 text-[15px] leading-8 text-[#1f1720] shadow-[0_10px_24px_rgba(31,23,32,0.05)] outline-none transition placeholder:text-[#9b8d95] focus:border-[#e9c6d6] focus:ring-2 focus:ring-[#f3e3ea] focus:ring-offset-1",
                    editorFocused && "shadow-[0_18px_40px_rgba(31,23,32,0.10)]"
                  )}
                />

                    <div
                    className={cn(
                      "rounded-[20px] border border-black/5 bg-[#fcf9fb] p-3 transition shadow-[0_4px_10px_rgba(31,23,32,0.03)] sm:px-4 sm:py-3.5",
                      editorFocused && "opacity-60"
                    )}
                  >
                    <p className="text-xs font-medium text-[#6B5A63]">Dacă vrei, poți începe de aici:</p>
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
                          className="rounded-full border border-black/5 bg-white px-3.5 py-2 text-[11px] font-semibold tracking-[0.03em] text-[#1f1720] shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-black/5"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-[20px] border border-black/5 bg-[#fffdfd] p-3 shadow-[0_4px_10px_rgba(31,23,32,0.03)] transition sm:p-4",
                    editorFocused && "opacity-60"
                  )}
                >
                  <input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Adaugă un titlu (opțional)…"
                    className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-[#1f1720] shadow-[0_4px_10px_rgba(31,23,32,0.04)] outline-none transition placeholder:text-[#9b8d95] focus:border-[#ead7df] focus:ring-2 focus:ring-[#f3e3ea]"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8a7b83]">
                  <span>
                    {draftSaveState === "saving"
                      ? "Se salvează automat..."
                      : draftSaveState === "saved"
                        ? "Salvat automat"
                        : ""}
                  </span>
                </div>

                <div className="flex flex-col-reverse gap-4 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        setSaving(false);
                        setEditingId(null);
                        setEditorFocused(false);
                        setDraftSaveState("idle");
                      }}
                      className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1720] shadow-[0_6px_14px_rgba(31,23,32,0.06)] transition hover:bg-black/5"
                    >
                      Continuă mai târziu
                    </button>

                    {editingId ? (
                      <button
                        type="button"
                        onClick={deleteEntry}
                        disabled={saving}
                        className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-[0_6px_14px_rgba(31,23,32,0.06)] transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        Șterge
                      </button>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={saveEntry}
                    disabled={saving || !draftContent.trim()}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,135,192,0.22)] transition hover:opacity-95 disabled:opacity-50"
                  >
                    {saving ? "Se salvează…" : editingId ? "Salvează modificările" : "Salvează nota"}
                  </button>
                </div>
              </div>
            </ModalShell>
          </div>
        ) : null}

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
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
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

    </section>
  );
}