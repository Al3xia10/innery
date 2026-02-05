"use client";

import * as React from "react";
import { useTherapistProfile } from "@/app/_lib/profile";

type NoteTag = "Today" | "Yesterday" | "3 days ago" | "Individual session" | "Couple session" | "Draft";

type Note = {
  id: string;
  therapistId: string;
  title: string;
  dateLabel: "Today" | "Yesterday" | "3 days ago";
  preview: string;
  tags: NoteTag[];
  content: string;
  updatedAtISO: string;
};

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = (require("next/navigation") as any).useParams?.() as { therapistId?: string };
  const therapistId = params?.therapistId ?? "t1";
  const therapistProfile = useTherapistProfile(therapistId, therapistId, "therapist@innery.com");
  const displayTherapistName = therapistProfile?.name ?? therapistId;

  const seed = React.useMemo<Note[]>(
    () => [
      {
        id: "note_anna",
        therapistId,
        title: "Session reflection – Anna M.",
        dateLabel: "Today",
        preview: "Client expressed increased awareness around emotional triggers...",
        tags: ["Today", "Individual session", "Draft"],
        content:
          "Client expressed increased awareness around emotional triggers. We explored a recent situation and identified early body signals and thought patterns. Next step: short grounding routine + journaling prompt before next session.",
        updatedAtISO: nowISO(),
      },
      {
        id: "note_daniel",
        therapistId,
        title: "Follow-up notes – Daniel R.",
        dateLabel: "Yesterday",
        preview: "Discussed progress since last session and areas of resistance...",
        tags: ["Yesterday", "Individual session"],
        content:
          "Discussed progress since last session. Noted resistance when talking about family boundaries. Agreed on one small action: practice saying no once this week and capture feelings afterwards.",
        updatedAtISO: nowISO(),
      },
      {
        id: "note_maria",
        therapistId,
        title: "Couple session – Maria L.",
        dateLabel: "3 days ago",
        preview: "Focused on communication patterns and emotional validation...",
        tags: ["3 days ago", "Couple session"],
        content:
          "Focused on communication patterns and emotional validation. Introduced reflective listening. Homework: 10-minute check-in 3 times this week using the script.",
        updatedAtISO: nowISO(),
      },
    ],
    [therapistId]
  );

  const [notes, setNotes] = React.useState<Note[]>(seed);
  const [selectedId, setSelectedId] = React.useState<string>(seed[0]?.id ?? "");
  const [query, setQuery] = React.useState<string>("");
  const [filter, setFilter] = React.useState<"all" | "recent">("all");
  const [draftById, setDraftById] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const n of seed) init[n.id] = n.content;
    return init;
  });

  // When seed changes (therapistId changes), reset.
  React.useEffect(() => {
    setNotes(seed);
    setSelectedId(seed[0]?.id ?? "");
    setQuery("");
    setFilter("all");
    const init: Record<string, string> = {};
    for (const n of seed) init[n.id] = n.content;
    setDraftById(init);
  }, [seed]);

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

  function onNewNote() {
    const id = uid("note");
    const empty = "";
    const newNote: Note = {
      id,
      therapistId,
      title: "New note",
      dateLabel: "Today",
      preview: "",
      tags: ["Today", "Draft"],
      content: empty,
      updatedAtISO: nowISO(),
    };
    upsertNote(newNote);
    setDraftById((prev) => ({ ...prev, [id]: empty }));
    setSelectedId(id);
  }

  function onDuplicate() {
    if (!selectedNote) return;
    const id = uid("dup");
    const content = draftById[selectedNote.id] ?? selectedNote.content;
    const newNote: Note = {
      ...selectedNote,
      id,
      title: `${selectedNote.title} (copy)`,
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

  function onSave() {
    if (!selectedNote) return;
    const content = draftById[selectedNote.id] ?? selectedNote.content;
    const next: Note = {
      ...selectedNote,
      content,
      preview: makePreview(content),
      updatedAtISO: nowISO(),
      tags: (selectedNote.tags.includes("Draft") ? selectedNote.tags : (["Draft", ...selectedNote.tags] as NoteTag[])),
    };

    // If user wrote something, remove Draft tag (nice UX for demo)
    const hasRealContent = content.trim().length > 0;
    if (hasRealContent) {
      next.tags = next.tags.filter((t) => t !== "Draft");
    }

    upsertNote(next);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Therapist notes • {displayTherapistName}
          </div>
          <h1 className="mt-2 text-2xl sm:text-2xl font-semibold tracking-tight text-gray-900">Clinical notes</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-2xl">
            A quiet space to document sessions, reflections, and therapeutic insights — organized and easy to revisit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewNote}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            <PlusIcon />
            New note
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition " +
              (filter === "all"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            <TagIcon />
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("recent")}
            className={
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition " +
              (filter === "recent"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            <ClockIcon />
            Recent
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* NOTES LIST */}
        <aside className="lg:col-span-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Your notes</h2>
              <p className="mt-0.5 text-xs text-gray-500">Quick access to recent entries</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{filteredNotes.length}</span>
          </div>

          <div className="p-4 space-y-3 max-h-90 lg:max-h-[calc(100vh-260px)] overflow-auto">
            {filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm font-medium text-gray-900">No notes match your search</p>
                <p className="mt-1 text-xs text-gray-500">Try a different keyword or switch to “All”.</p>
              </div>
            ) : (
              filteredNotes.map((n) => (
                <NoteCard
                  key={n.id}
                  title={n.title}
                  date={n.dateLabel}
                  preview={n.preview || "(No content yet)"}
                  selected={n.id === selectedId}
                  onClick={() => selectNote(n.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* NOTE EDITOR */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {!selectedNote ? (
            <div className="p-10 text-center">
              <h3 className="text-base font-semibold text-gray-900">Select a note</h3>
              <p className="mt-2 text-sm text-gray-600">Choose a note on the left, or create a new one.</p>
              <button
                type="button"
                onClick={onNewNote}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
              >
                <PlusIcon />
                New note
              </button>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4">
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
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      <CopyIcon />
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-5">
                <textarea
                  value={draftById[selectedNote.id] ?? selectedNote.content}
                  onChange={(e) => onChangeDraft(e.target.value)}
                  placeholder="Write your session notes here..."
                  aria-label="Session note editor"
                  className="w-full min-h-80 lg:min-h-105 rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={onDiscard}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                  >
                    Discard
                  </button>

                  <button
                    type="button"
                    onClick={onSave}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                  >
                    Save note
                  </button>
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Demo mode • therapist: <span className="font-medium">{displayTherapistName}</span> • changes are kept in-memory (no backend yet)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
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
        "group relative w-full text-left rounded-2xl border p-4 shadow-sm transition cursor-pointer",
        selected
          ? "border-indigo-200 bg-indigo-50/40 shadow-md"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-0 top-3 bottom-3 w-1 rounded-full transition",
          selected ? "bg-indigo-500" : "bg-transparent group-hover:bg-indigo-200",
        ].join(" ")}
      />

      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-2">{date}</p>
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{preview}</p>
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

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>{tag}</span>;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
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