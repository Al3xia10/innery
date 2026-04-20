"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type NoteTag = "Today" | "Yesterday" | "3 days ago" | "Individual session" | "Couple session" | "Draft";

type Note = {
  id: string;
  therapistId: string;
  sessionId: string;
  clientId: string;
  clientName: string;
  sessionType: "Individual" | "Couple" | "Group" | "Unknown";
  scheduledAtISO: string;
  title: string;
  dateLabel: "Today" | "Yesterday" | "3 days ago";
  preview: string;
  tags: NoteTag[];
  content: string;
  updatedAtISO: string;
};

type ClientOption = { id: string; name: string };
type SessionOption = { id: string; clientUserId: string; label: string };

function makePreview(content: string) {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > 90 ? clean.slice(0, 90) + "…" : clean;
}

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix = "n") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function NotesPage() {
  // In a real app this comes from auth/session; for now we keep it dynamic-path friendly.
  // If the route is /therapist/t1/notes, this reads therapistId = "t1".
  // Works in Client Components.
  const params = useParams<{ therapistId?: string }>();
  const router = useRouter();
  const therapistId = String(params?.therapistId ?? "1");

  const [displayTherapistName, setDisplayTherapistName] = React.useState<string>(therapistId);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // Create-note modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [createClients, setCreateClients] = React.useState<ClientOption[]>([]);
  const [createClientId, setCreateClientId] = React.useState<string>("");
  const [createSessions, setCreateSessions] = React.useState<SessionOption[]>([]);
  const [createSessionId, setCreateSessionId] = React.useState<string>("");
  const [createContent, setCreateContent] = React.useState<string>("");

  const [notes, setNotes] = React.useState<Note[]>([]);
const [selectedId, setSelectedId] = React.useState<string>("");
const [query, setQuery] = React.useState<string>("");
const [filter, setFilter] = React.useState<"all" | "recent">("all");
const [draftById, setDraftById] = React.useState<Record<string, string>>({});

  // When seed changes (therapistId changes), reset.
  React.useEffect(() => {
  let alive = true;

  (async () => {
    try {
      setLoading(true);
      setError(null);

      const me = await apiFetch("/api/me", { method: "GET" });
      if (alive) setDisplayTherapistName(me?.user?.name ?? therapistId);

      const data = await apiFetch(`/api/therapists/${therapistId}/notes`, { method: "GET" });

      const toLabel = (iso: string): "Today" | "Yesterday" | "3 days ago" => {
        const d = new Date(iso);
        const now = new Date();
        const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const diffDays = Math.floor((startNow - startD) / (24 * 60 * 60 * 1000));
        if (diffDays <= 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return "3 days ago";
      };

      const toSessionTag = (): NoteTag => "Individual session";

      const next: Note[] = (data?.notes ?? []).map((n: any) => {
        const createdAt = String(n.createdAt ?? n.updatedAt ?? nowISO());
        const session = n.session ?? {};
        const client = session.clientUser ?? {};
        const clientName = String(client.name ?? "Client necunoscut");
        const sessionType = "Individual";

        const content = String(n.content ?? "");
        const title = `Notiță ședință – ${clientName}`;

        const dateLabel = toLabel(createdAt);
        const tags: NoteTag[] = [dateLabel, toSessionTag()];

        return {
          id: String(n.id),
          therapistId: String(n.therapistId ?? therapistId),
          sessionId: String(session.id ?? ""),
          clientId: String(client.id ?? session.clientUserId ?? ""),
          clientName,
          sessionType,
          scheduledAtISO: String(session.startsAt ?? ""),
          title,
          dateLabel,
          preview: makePreview(content),
          tags,
          content,
          updatedAtISO: String(n.updatedAt ?? createdAt),
        };
      });

      if (alive) {
        setNotes(next);
        setSelectedId(next[0]?.id ?? "");
        const initDraft: Record<string, string> = {};
        for (const nn of next) initDraft[nn.id] = nn.content;
        setDraftById(initDraft);
        setQuery("");
        setFilter("all");
      }
    } catch (e: any) {
      if (alive) setError(e?.message || "Nu am putut încărca notițele");
    } finally {
      if (alive) setLoading(false);
    }
  })();

  return () => {
    alive = false;
  };
}, [therapistId]);

  const selectedNote = React.useMemo(() => notes.find((n) => n.id === selectedId), [notes, selectedId]);

  const filteredNotes = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = notes;

    if (filter === "recent") {
      // "Recent" = last 2 buckets in this mock. You can change logic later.
      list = list.filter((n) => n.dateLabel === "Today" || n.dateLabel === "Yesterday");
    }

    if (!q) return list;

    return list.filter((n) => {
      const hay = `${n.title} ${n.preview} ${n.content}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, query, filter]);

  function selectNote(id: string) {
    setSelectedId(id);
  }

  function upsertNote(next: Note) {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = prev.slice();
      copy[idx] = next;
      return copy;
    });
  }

  function defaultNowLocal(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function loadCreateClients() {
    const data = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
    const linked = (data?.clients ?? []).filter((c: any) => c.kind === "linked");
    const opts: ClientOption[] = linked.map((c: any) => ({
      id: String(c.user?.id ?? c.id),
      name: String(c.user?.name ?? c.name ?? c.email ?? "Client"),
    }));
    setCreateClients(opts);
    if (!createClientId && opts[0]?.id) setCreateClientId(opts[0].id);
  }

  async function loadCreateSessions(clientUserId: string) {
    const data = await apiFetch(`/api/therapists/${therapistId}/sessions`, { method: "GET" });
    const all: SessionOption[] = (data?.sessions ?? []).map((s: any) => ({
      id: String(s.id),
      clientUserId: String(s.clientUserId),
      label: `${new Date(String(s.startsAt)).toLocaleString()} • ${String(s.status ?? "Scheduled")} • ${String(s.type ?? "Individual")}`,
    }));
    const filtered = all.filter((s) => s.clientUserId === String(clientUserId));
    setCreateSessions(filtered);
    setCreateSessionId(filtered[0]?.id ?? "");
  }

  async function openCreateModal() {
    setCreateError(null);
    setCreateContent("");
    setCreateSessions([]);
    setCreateSessionId("");

    try {
      setCreateLoading(true);
      await loadCreateClients();
    } catch (e: any) {
      setCreateError(e?.message || "Failed to load clients");
    } finally {
      setCreateLoading(false);
    }

    setCreateOpen(true);
  }

  function closeCreateModal() {
    setCreateOpen(false);
  }

  async function onCreateNoteConfirm() {
    if (!createClientId) {
      setCreateError("Select a client.");
      return;
    }
    if (!createSessionId) {
      setCreateError("Select a session for this client.");
      return;
    }

    const content = createContent.trim();
    if (!content) {
      setCreateError("Write something in the note.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      const data = await apiFetch(
        `/api/therapists/${therapistId}/sessions/${createSessionId}/notes`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );

      const createdAt = String(data?.note?.createdAt ?? nowISO());
      const createdId = String(data?.note?.id ?? uid("note"));

      // Refresh notes list entry (prepend)
      const sessionPick = createSessions.find((s) => s.id === createSessionId);
      const clientPick = createClients.find((c) => c.id === createClientId);

      const newNote: Note = {
        id: createdId,
        therapistId,
        sessionId: String(createSessionId),
        clientId: String(createClientId),
        clientName: String(clientPick?.name ?? "Client necunoscut"),
        sessionType: "Unknown",
        scheduledAtISO: "",
        title: `Notiță ședință – ${String(clientPick?.name ?? "Client")}`,
        dateLabel: "Today",
        preview: makePreview(content),
        tags: ["Today"],
        content,
        updatedAtISO: createdAt,
      };

      setNotes((prev) => {
        const without = prev.filter((n) => n.id !== newNote.id);
        return [newNote, ...without];
      });
      setDraftById((prev) => ({ ...prev, [newNote.id]: content }));
      setSelectedId(newNote.id);

      closeCreateModal();
    } catch (e: any) {
      setCreateError(e?.message || "Nu am putut salva notița");
    } finally {
      setCreateLoading(false);
    }
  }

  function onNewNote() {
    void openCreateModal();
  }

  function onDuplicate() {
    if (!selectedNote) return;
    const id = uid("dup");
    const content = draftById[selectedNote.id] ?? selectedNote.content;
    const newNote: Note = {
      ...selectedNote,
      id,
      title: `${selectedNote.title} (copie)`,
      content,
      preview: makePreview(content),
      updatedAtISO: nowISO(),
      tags: Array.from(new Set(["Draft", ...selectedNote.tags])) as NoteTag[],
    };
    upsertNote(newNote);
    setDraftById((prev) => ({ ...prev, [id]: content }));
    setSelectedId(id);
  }

  function onChangeDraft(value: string) {
    if (!selectedNote) return;
    setDraftById((prev) => ({ ...prev, [selectedNote.id]: value }));
  }

  function onDiscard() {
    if (!selectedNote) return;
    setDraftById((prev) => ({ ...prev, [selectedNote.id]: selectedNote.content }));
  }

  async function onSave() {
    if (!selectedNote) return;

    const content = (draftById[selectedNote.id] ?? selectedNote.content).trim();
    if (!content) return;

    const isDraft = selectedNote.tags.includes("Draft") || selectedNote.id.startsWith("note_") || selectedNote.id.startsWith("dup_");

    try {
      if (!isDraft) {
        // Update existing note
        const data = await apiFetch(`/api/therapists/${therapistId}/notes/${selectedNote.id}`, {
          method: "PATCH",
          body: JSON.stringify({ content }),
        });

        const updatedAt = String(data?.note?.updatedAt ?? nowISO());
        const nextNote: Note = {
          ...selectedNote,
          content,
          preview: makePreview(content),
          updatedAtISO: updatedAt,
          tags: selectedNote.tags.filter((t) => t !== "Draft") as NoteTag[],
        };

        upsertNote(nextNote);
        setDraftById((prev) => ({ ...prev, [nextNote.id]: content }));
        return;
      }

      // Drafts must be linked to a session to be created
      if (!selectedNote.sessionId) {
        alert("Această notiță nu este încă asociată unei ședințe. Folosește Notiță nouă pentru a alege clientul și ședința.");
        return;
      }

      // Create a new note (POST) for drafts
      const data = await apiFetch(`/api/therapists/${therapistId}/sessions/${selectedNote.sessionId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      const createdAt = String(data?.note?.createdAt ?? nowISO());
      const createdId = String(data?.note?.id ?? uid("note"));

      const nextNote: Note = {
        ...selectedNote,
        id: createdId,
        content,
        preview: makePreview(content),
        updatedAtISO: createdAt,
        tags: Array.from(new Set(["Today", ...selectedNote.tags.filter((t) => t !== "Draft")])) as NoteTag[],
        dateLabel: "Today",
      };

      setNotes((prev) => {
        const without = prev.filter((n) => n.id !== nextNote.id);
        return [nextNote, ...without];
      });
      setDraftById((prev) => ({ ...prev, [nextNote.id]: content }));
      setSelectedId(nextNote.id);
    } catch (e: any) {
      alert(e?.message || "Nu am putut salva notița");
    }
  }
  React.useEffect(() => {
    if (!createOpen) return;
    if (!createClientId) return;

    let alive = true;
    (async () => {
      try {
        setCreateError(null);
        setCreateLoading(true);
        await loadCreateSessions(createClientId);
      } catch (e: any) {
        if (alive) setCreateError(e?.message || "Failed to load sessions");
      } finally {
        if (alive) setCreateLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOpen, createClientId]);

  return (
    <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
      {/* PAGE HEADER */}
      {/* PAGE HEADER */}
<section
  className="overflow-hidden rounded-[28px] border border-black/5 shadow-sm sm:rounded-4xl"
  style={{
    background:
      "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
  }}
>
  <div className="flex flex-col gap-4 p-4 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
    <div className="max-w-3xl">
      <h1 className="mt-1 w-full text-[2rem] font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl">
        Notițe clinice
      </h1>
      <p className="mt-3 max-w-[30ch] text-[14px] leading-7 text-[#6B5A63] sm:max-w-2xl sm:text-base">
        Un spațiu liniștit pentru a documenta ședințe, reflecții și observații terapeutice pentru{" "}
        <span className="font-semibold text-slate-900">{displayTherapistName}</span>.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div className="rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Total</p>
          <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{notes.length}</p>
          <p className="mt-1.5 text-xs text-[#6B5A63]">notițe</p>
        </div>
        <div className="rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Afișate</p>
          <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{filteredNotes.length}</p>
          <p className="mt-1.5 text-xs text-[#6B5A63]">rezultate</p>
        </div>
        <div className="col-span-2 rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm sm:col-span-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Recente</p>
          <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">
            {notes.filter((n) => n.dateLabel === "Today" || n.dateLabel === "Yesterday").length}
          </p>
          <p className="mt-1.5 text-xs text-[#6B5A63]">ultimele intrări</p>
        </div>
      </div>
    </div>

    <div className="mt-2 grid w-full grid-cols-1 gap-2.5 self-start sm:flex sm:w-auto sm:items-center sm:gap-3">
      <button
        type="button"
        onClick={onNewNote}
        className="mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-(--color-accent) px-4 py-3 text-center text-sm font-semibold leading-5 text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:-translate-y-px hover:opacity-90 disabled:opacity-50 sm:min-w-36 sm:w-auto sm:whitespace-nowrap sm:rounded-2xl sm:px-5"
      >
        <PlusIcon />
        Notiță nouă
      </button>
    </div>
  </div>
</section>

      {/* TOOLBAR */}
      {/* TOOLBAR */}
<div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
  <label className="relative block w-full xl:max-w-115">
    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
      <SearchIcon />
    </div>
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Caută în notițe…"
      aria-label="Caută în notițe"
      className="w-full rounded-2xl border border-black/5 bg-white/90 py-3 pl-10 pr-3 text-sm text-gray-900 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-(--color-soft)/45 placeholder:text-gray-400 outline-none transition focus:border-(--color-soft) focus:bg-white focus:ring-2 focus:ring-(--color-soft)"
    />
  </label>

  <div className="flex flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={() => setFilter("all")}
      className={
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition " +
        (filter === "all"
          ? "border-(--color-soft) bg-(--color-card) text-(--color-primary)"
          : "border-black/5 bg-white/85 text-gray-700 hover:bg-white")
      }
    >
      <TagIcon />
      Toate
    </button>

    <button
      type="button"
      onClick={() => setFilter("recent")}
      className={
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition " +
        (filter === "recent"
          ? "border-(--color-soft) bg-(--color-card) text-(--color-primary)"
          : "border-black/5 bg-white/85 text-gray-700 hover:bg-white")
      }
    >
      <ClockIcon />
      Recente
    </button>
  </div>
</div>

      {/* MAIN GRID */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 xl:grid-cols-[1.08fr_1.92fr]">
        {/* NOTES LIST */}
        <aside className="overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-4xl xl:col-span-1">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Notițele tale</h2>
              <p className="mt-0.5 text-xs text-[#6B5A63]">Acces rapid la intrările recente</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{filteredNotes.length}</span>
          </div>

          <div className="max-h-90 space-y-3 overflow-auto p-3 sm:p-4 lg:max-h-[calc(100vh-260px)]">
  {loading ? (
    <div className="rounded-2xl border border-black/5 bg-white/85 p-6 text-sm text-gray-700 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
      Se încarcă notițele…
    </div>
  ) : error ? (
    <div className="rounded-2xl border border-dashed border-black/10 bg-(--color-card) p-6 text-sm text-[#6B5A63] shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
      {error}
    </div>
  ) : filteredNotes.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-black/10 bg-(--color-card) p-6 text-sm text-[#6B5A63] shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
      Nu există încă notițe. Creează prima notiță din <span className="font-medium">Ședințe</span>.
    </div>
  ) : (
    filteredNotes.map((n) => (
      <NoteCard
        key={n.id}
        title={n.title}
        date={n.dateLabel}
        preview={n.preview || "(Fără conținut încă)"}
        selected={n.id === selectedId}
        onClick={() => selectNote(n.id)}
      />
    ))
  )}
</div>
        </aside>

        {/* NOTE EDITOR */}
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-4xl xl:col-span-1">
          {!selectedNote ? (
            <div className="p-10 text-center">
              <h3 className="text-base font-semibold text-gray-900">Selectează o notiță</h3>
              <p className="mt-2 text-sm text-gray-600">Alege o notiță din stânga sau creează una nouă.</p>
              <button
                type="button"
                onClick={onNewNote}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95"
              >
                <PlusIcon />
                Notiță nouă
              </button>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-black/5 bg-white/90 px-6 py-4 backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{selectedNote.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedNote.tags.map((t) => (
                        <TagPill key={t} tag={t} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onDuplicate}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      <CopyIcon />
                      Duplică
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-5">
                <textarea
                  value={draftById[selectedNote.id] ?? selectedNote.content}
                  onChange={(e) => onChangeDraft(e.target.value)}
                  placeholder="Scrie aici notițele de ședință..."
                  aria-label="Editor notiță de ședință"
                  className="w-full min-h-80 resize-none rounded-2xl border border-black/5 bg-white p-4 text-sm leading-relaxed text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] placeholder:text-gray-400 outline-none transition focus:border-(--color-soft) lg:min-h-105"
                />

                <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={onDiscard}
                    className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-card) ring-1 ring-(--color-soft)"
                  >
                    Șterge
                  </button>

                  <button
                    type="button"
                    onClick={onSave}
                    className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-90"
                  >
                    Salvează notița
                  </button>
                </div>

                <p className="mt-3 text-xs text-[#6B5A63]">
                  Salvat în workspace-ul tău privat • terapeut: <span className="font-medium">{displayTherapistName}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {/* CREATE NOTE MODAL */}
      {createOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={closeCreateModal}
        >
          <div
            className="mx-auto mt-24 w-[92%] max-w-lg overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_48px_rgba(31,23,32,0.18)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.14)_65%,rgba(125,128,218,0.06)_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="mt-3 text-[1.05rem] font-semibold text-gray-900">Notiță nouă</h3>
                  <p className="mt-1 text-sm text-gray-600">Alege un client și o ședință, apoi scrie notița.</p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
                  aria-label="Close"
                >
                  <XIcon />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">Client</span>
                  <select
                    value={createClientId}
                    onChange={(e) => setCreateClientId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                  >
                    <option value="" disabled>
                      {createClients.length ? "Selectează un client" : "Nu există clienți conectați"}
                    </option>
                    {createClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">Ședință</span>
                  <select
                    value={createSessionId}
                    onChange={(e) => setCreateSessionId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                    disabled={!createClientId}
                  >
                    <option value="" disabled>
                      {createClientId
                        ? createSessions.length
                          ? "Selectează o ședință"
                          : "Nu există ședințe pentru acest client"
                        : "Selectează mai întâi un client"}
                    </option>
                    {createSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">Notiță</span>
                  <textarea
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder={`Scrie notița… (${defaultNowLocal()})`}
                    rows={6}
                    className="mt-2 w-full rounded-xl border border-black/5 bg-white p-3 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                  />
                </label>

                {createError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 shadow-[0_4px_12px_rgba(31,23,32,0.03)]">{translateCreateError(createError)}</div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
                    disabled={createLoading}
                  >
                    Renunță
                  </button>

                  <button
                    type="button"
                    onClick={onCreateNoteConfirm}
                    className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95 disabled:opacity-50"
                    disabled={createLoading}
                  >
                    {createLoading ? "Se salvează…" : "Salvează notița"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}


/* NOTE CARD */
function NoteCard({
  title,
  date,
  preview,
  selected,
  onClick,
}: {
  title: string;
  date: string;
  preview: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-[20px] border px-4 py-4 text-left shadow-[0_10px_24px_rgba(31,23,32,0.06)] transition cursor-pointer",
        selected
          ? "border-[#ead7df] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,249,251,0.98)_100%)] shadow-[0_12px_28px_rgba(31,23,32,0.08)]"
          : "border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,249,251,0.98)_100%)] hover:shadow-[0_12px_28px_rgba(31,23,32,0.08)]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-4 right-4 top-0 h-px transition",
          selected
            ? "bg-[linear-gradient(90deg,rgba(239,208,202,0.8),transparent)]"
            : "bg-[linear-gradient(90deg,rgba(125,128,218,0.35),transparent)] group-hover:bg-[linear-gradient(90deg,rgba(125,128,218,0.55),transparent)]",
        ].join(" ")}
      />

      <h3 className="mb-1 truncate text-[1.02rem] font-semibold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{date}</p>
      <p className="line-clamp-2 text-[14px] leading-7 text-gray-700">{preview}</p>
    </button>
  );
}

function TagPill({ tag }: { tag: NoteTag }) {
  const cls =
    tag === "Individual session"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
      : tag === "Couple session"
      ? "bg-violet-50 text-violet-700 ring-violet-100"
      : tag === "Draft"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-gray-50 text-gray-700 ring-gray-200";

  const label =
    tag === "Today"
      ? "Astăzi"
      : tag === "Yesterday"
      ? "Ieri"
      : tag === "3 days ago"
      ? "Acum 3 zile"
      : tag === "Individual session"
      ? "Ședință individuală"
      : tag === "Couple session"
      ? "Ședință de cuplu"
      : "Ciornă";

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>{label}</span>;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M3.5 11.5V4.75A1.75 1.75 0 0 1 5.25 3h6.75a1.75 1.75 0 0 1 1.24.51l7.25 7.25a2 2 0 0 1 0 2.83l-6.9 6.9a2 2 0 0 1-2.83 0L4.01 12.74A1.75 1.75 0 0 1 3.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M7.75 7.75h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M8 8.5V6.25A1.75 1.75 0 0 1 9.75 4.5h8A1.75 1.75 0 0 1 19.5 6.25v8A1.75 1.75 0 0 1 17.75 16H15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 8.5h8A1.75 1.75 0 0 1 16 10.25v8A1.75 1.75 0 0 1 14.25 20h-8A1.75 1.75 0 0 1 4.5 18.25v-8A1.75 1.75 0 0 1 6.25 8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
// Helper to translate create modal errors
function translateCreateError(msg: string) {
  if (msg === "Select a client.") return "Selectează un client.";
  if (msg === "Select a session for this client.") return "Selectează o ședință pentru acest client.";
  if (msg === "Write something in the note.") return "Scrie ceva în notiță.";
  if (msg === "Failed to load clients") return "Nu am putut încărca clienții";
  if (msg === "Failed to load sessions") return "Nu am putut încărca ședințele";
  if (msg === "Failed to save note") return "Nu am putut salva notița";
  return msg;
}