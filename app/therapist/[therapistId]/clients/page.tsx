"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients as allClients, therapists } from "@/app/_mock/data";
import { getClientProfile, useTherapistProfile } from "@/app/_lib/profile";

type ClientStatus = "Active" | "Paused";

type Client = {
  id: string;
  therapistId: string;
  name: string;
  status?: ClientStatus;
  lastSession?: string;
};

function uid(prefix = "c") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (first + second).toUpperCase();
}

export default function ClientsPage() {
  const params = useParams<{ therapistId: string }>();
  const therapistId = params?.therapistId ?? "t1";

  // Avoid hydration mismatches when profiles are read from localStorage.
  // During the server pre-render of this Client Component, `window` isn't available,
  // so profile helpers will fall back to defaults. We only apply overrides after mount.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const therapist = therapists.find((t) => t.id === therapistId);

  const therapistProfile = useTherapistProfile(
  therapistId,
  therapist?.name ?? therapistId,
  (therapist as any)?.email ?? "therapist@innery.com"
);

  const seed = React.useMemo<Client[]>(() => {
    return allClients
      .filter((c) => c.therapistId === therapistId)
      .map((c) => ({
        ...c,
        status: (c as any).status ?? "Active",
        lastSession: (c as any).lastSession ?? "—",
      }));
  }, [therapistId]);

  const [clients, setClients] = React.useState<Client[]>(seed);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | ClientStatus>("all");

  const [profileTick, setProfileTick] = React.useState(0);

  // Re-render when local profile overrides change (same tab or other tabs)
  React.useEffect(() => {
    const bump = () => setProfileTick((x) => x + 1);
    const onStorage = () => bump();
    const onClient = () => bump();
    const onTherapist = () => bump();

    window.addEventListener("storage", onStorage);
    window.addEventListener("innery:client-profile-update", onClient as EventListener);
    window.addEventListener("innery:therapist-profile-update", onTherapist as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("innery:client-profile-update", onClient as EventListener);
      window.removeEventListener("innery:therapist-profile-update", onTherapist as EventListener);
    };
  }, []);

  // Ensure we actually re-compute derived names when profileTick changes
  void profileTick;

  // Add client modal state
  const [open, setOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftStatus, setDraftStatus] = React.useState<ClientStatus>("Active");

  React.useEffect(() => {
    setClients(seed);
    setQuery("");
    setStatusFilter("all");
    setOpen(false);
    setDraftName("");
    setDraftStatus("Active");
  }, [seed]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients;

    if (statusFilter !== "all") {
      list = list.filter((c) => (c.status ?? "Active") === statusFilter);
    }

    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [clients, query, statusFilter]);

  function onOpenAdd() {
    setDraftName("");
    setDraftStatus("Active");
    setOpen(true);
  }

  function onAddClient() {
    const name = draftName.trim();
    if (!name) return;

    const next: Client = {
      id: uid("c"),
      therapistId,
      name,
      status: draftStatus,
      lastSession: "—",
    };

    setClients((prev) => [next, ...prev]);
    setOpen(false);
  }

  function onToggleStatus(clientId: string) {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              status: (c.status ?? "Active") === "Active" ? "Paused" : "Active",
            }
          : c
      )
    );
  }

  function onRemove(clientId: string) {
    // Demo-only; remove in-memory
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Workspace
          </div>
          <h1 className="mt-2 text-2xl sm:text-2xl font-semibold tracking-tight text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-2xl">
            Clients currently assigned to{" "}
            <span className="font-semibold text-gray-900" suppressHydrationWarning>
  {therapistProfile.name}
</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            <PlusIcon />
            Add client
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
            placeholder="Search clients…"
            aria-label="Search clients"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            All
          </FilterButton>
          <FilterButton active={statusFilter === "Active"} onClick={() => setStatusFilter("Active")}>
            Active
          </FilterButton>
          <FilterButton active={statusFilter === "Paused"} onClick={() => setStatusFilter("Paused")}>
            Paused
          </FilterButton>
        </div>
      </div>

      {/* GRID */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <h3 className="text-sm font-semibold text-gray-900">No clients found</h3>
            <p className="mt-2 text-sm text-gray-600">Try a different search or add a new client.</p>
            <button
              type="button"
              onClick={onOpenAdd}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
            >
              <PlusIcon />
              Add client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((client) => (
              <ClientCard
                key={client.id}
                therapistId={therapistId}
                client={client}
                profileTick={profileTick}
                mounted={mounted}
                onToggleStatus={() => onToggleStatus(client.id)}
                onRemove={() => onRemove(client.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="mx-auto mt-24 w-[92%] max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Add client</h3>
                <p className="mt-1 text-sm text-gray-600">Create a new client entry (demo: stored in-memory).</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Client name</span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g., Anna M."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Status</span>
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as ClientStatus)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onAddClient}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* CLIENT CARD */
function ClientCard({
  therapistId,
  client,
  profileTick,
  mounted,
  onToggleStatus,
  onRemove,
}: {
  therapistId: string;
  client: Client;
  profileTick: number;
  mounted: boolean;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  // Re-compute when profileTick changes
  void profileTick;

  const fallbackEmail = (client as any)?.email ?? "client@innery.com";
  const displayClientName = mounted
    ? getClientProfile(client.id, client.name, fallbackEmail).name
    : client.name;

  const initials = initialsFromName(displayClientName);
  const status = client.status ?? "Active";

  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate" suppressHydrationWarning>
              {displayClientName}
            </p>
            <p className="text-xs text-gray-500">Last session: {client.lastSession ?? "—"}</p>
          </div>
        </div>

        <span
          className={
            "shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 " +
            (status === "Active"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : "bg-gray-50 text-gray-700 ring-gray-200")
          }
        >
          {status}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="mt-5">
        {/* Mobile: stacked buttons */}
        <div className="flex flex-col gap-2 sm:hidden">
          <Link
            href={`/therapist/${therapistId}/clients/${client.id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            Open profile
          </Link>

          <button
            type="button"
            onClick={onToggleStatus}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            {status === "Active" ? "Pause" : "Activate"}
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100 transition"
            aria-label="Remove client"
            title="Remove (demo)"
          >
            Remove
          </button>
        </div>

        {/* Tablet: dropdown only */}
        <div className="hidden sm:flex xl:hidden items-center justify-end">
          <details className="relative">
            <summary
              className="list-none inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition cursor-pointer select-none [&::-webkit-details-marker]:hidden"
              aria-label="More actions"
            >
              More
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </summary>

            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg z-20">
              <div className="py-1">
                <Link
                  href={`/therapist/${therapistId}/clients/${client.id}`}
                  onClick={(e) => {
                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gray-500" aria-hidden="true">
                    <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  Open profile
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                    onToggleStatus();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gray-500" aria-hidden="true">
                    <path d="M10 9v6M14 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {status === "Active" ? "Pause" : "Activate"}
                </button>

                <div className="my-1 h-px bg-gray-100" />

                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                    onRemove();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition"
                  aria-label="Remove client"
                  title="Remove (demo)"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-rose-600" aria-hidden="true">
                    <path d="M6 7h12M10 11v7M14 11v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 7l1-2h4l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 7l1 14h8l1-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Laptop/Desktop: compact inline buttons */}
        <div className="hidden xl:flex items-center justify-end gap-2">
          <Link
            href={`/therapist/${therapistId}/clients/${client.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            Open profile
          </Link>

          <button
            type="button"
            onClick={onToggleStatus}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            {status === "Active" ? "Pause" : "Activate"}
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100 transition"
            aria-label="Remove client"
            title="Remove (demo)"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">Demo mode • stored in-memory • refresh resets</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition " +
        (active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
      }
    >
      {children}
    </button>
  );
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

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}