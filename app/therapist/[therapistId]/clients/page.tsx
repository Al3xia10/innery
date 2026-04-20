"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type ClientStatus = "Active" | "Paused" | "Invited";

type Client = {
  id: string;
  kind: "linked" | "invite";
  therapistId: string;
  name: string;
  email?: string;
  status?: ClientStatus;
  lastSession?: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (first + second).toUpperCase();
}

function mapClientRow(row: any, therapistId: string): Client {
  const kind: "linked" | "invite" = row?.kind === "invite" ? "invite" : "linked";

  if (kind === "invite") {
    return {
      id: String(row?.id ?? row?.invite?.id ?? ""),
      kind: "invite",
      therapistId: String(row?.therapistId ?? therapistId),
      name: String(row?.name ?? row?.email ?? "Invited client"),
      email: String(row?.email ?? ""),
      status: "Invited",
      lastSession: String(row?.lastSession ?? "—"),
    };
  }

  const userId = String(row?.user?.id ?? row?.userId ?? row?.id);
  return {
    id: userId,
    kind: "linked",
    therapistId: String(row?.therapistId ?? therapistId),
    name: String(row?.user?.name ?? row?.name ?? "Client"),
    email: String(row?.user?.email ?? row?.email ?? ""),
    status: (row?.status === "Paused" ? "Paused" : "Active") as ClientStatus,
    lastSession: String(row?.lastSession ?? row?.lastSessionAt ?? "—"),
  };
}

export default function ClientsPage() {
  const params = useParams<{ therapistId: string }>();
  const therapistId = params?.therapistId ?? "";

  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [therapistName, setTherapistName] = React.useState<string>(therapistId);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | ClientStatus>("all");

  const [open, setOpen] = React.useState(false);
  const [draftEmail, setDraftEmail] = React.useState("");
  const [draftName, setDraftName] = React.useState("");

  const refreshClients = React.useCallback(async () => {
    const data = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
    const next: Client[] = (data?.clients ?? []).map((row: any) => mapClientRow(row, therapistId));
    setClients(next);
  }, [therapistId]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          const me = await apiFetch("/api/me", { method: "GET" });
          if (alive) setTherapistName(me?.user?.name ?? therapistId);
        } catch {
          if (alive) setTherapistName(therapistId);
        }

        const data = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
        const next: Client[] = (data?.clients ?? []).map((row: any) => mapClientRow(row, therapistId));

        if (alive) setClients(next);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load clients");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [therapistId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients;

    if (statusFilter !== "all") {
      list = list.filter((c) => (c.status ?? (c.kind === "invite" ? "Invited" : "Active")) === statusFilter);
    }

    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.email ? c.email.toLowerCase().includes(q) : false)
    );
  }, [clients, query, statusFilter]);

  const counts = React.useMemo(() => {
    const active = clients.filter((c) => (c.status ?? (c.kind === "invite" ? "Invited" : "Active")) === "Active").length;
    const paused = clients.filter((c) => c.status === "Paused").length;
    const invited = clients.filter((c) => c.kind === "invite").length;
    return {
      total: clients.length,
      active,
      paused,
      invited,
    };
  }, [clients]);

  function onOpenAdd() {
    setDraftEmail("");
    setDraftName("");
    setOpen(true);
  }

  async function onAddClient() {
    const email = draftEmail.trim().toLowerCase();
    const name = draftName.trim();

    if (!email) return;

    try {
      setError(null);
      await apiFetch(`/api/therapists/${therapistId}/clients`, {
        method: "POST",
        body: JSON.stringify({ email, name: name || undefined }),
      });

      setOpen(false);
      setDraftEmail("");
      setDraftName("");
      await refreshClients();
    } catch (e: any) {
      setError(e?.message || "Failed to invite client");
    }
  }

  async function onToggleStatus(clientId: string) {
    const current = clients.find((c) => c.id === clientId);
    if (!current || current.kind === "invite") return;

    const nextStatus: ClientStatus = (current.status ?? "Active") === "Active" ? "Paused" : "Active";

    try {
      setError(null);
      await apiFetch(`/api/therapists/${therapistId}/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await refreshClients();
    } catch (e: any) {
      setError(e?.message || "Failed to update status");
    }
  }

  async function onRemove(clientId: string) {
    try {
      setError(null);
      await apiFetch(`/api/therapists/${therapistId}/clients/${clientId}`, { method: "DELETE" });
      await refreshClients();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  }

  
  return (
    <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
      <div
        className="overflow-hidden rounded-[34px] border border-black/5 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
        }}
      >
        <div className="px-4 py-5 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="mt-4 text-[2rem] w-full leading-[1.02] font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Clienți
              </h1>
              <p className="mt-3 max-w-[30ch] sm:max-w-2xl text-[14px] leading-7 text-[#6B5A63] sm:text-base">
                Gestionează persoanele alocate lui <span className="font-semibold text-slate-900">{therapistName}</span>, invită clienți noi și păstrează workspace-ul organizat.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <div className="rounded-[20px] bg-white/80 px-4 py-3.5 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Total</p>
                  <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{counts.total}</p>
                  <p className="mt-1.5 text-xs text-[#6B5A63]">clienți</p>
                </div>
                <div className="rounded-[20px] bg-white/80 px-4 py-3.5 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Activi</p>
                  <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{counts.active}</p>
                  <p className="mt-1.5 text-xs text-[#6B5A63]">în grijă</p>
                </div>
                <div className="col-span-2 rounded-[20px] bg-white/80 px-4 py-3.5 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm sm:col-span-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Invitați</p>
                  <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{counts.invited}</p>
                  <p className="mt-1.5 text-xs text-[#6B5A63]">în așteptare</p>
                </div>
              </div>
            </div>
            <div className="mt-2 grid w-full grid-cols-2 gap-2.5 self-start sm:flex sm:w-auto sm:items-center sm:gap-3">
              <Link
                href={`/therapist/${therapistId}`}
                className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center rounded-2xl border border-black/5 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white sm:rounded-2xl"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={onOpenAdd}
                className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-(--color-accent) px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:rounded-2xl"
              >
                <PlusIcon />
                Adaugă client
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <section
            className="rounded-[28px] sm:rounded-4xl border border-black/5 shadow-sm overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
            }}
          >
            <div className="p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Lista de clienți</h2>
                <p className="mt-1 text-sm text-[#6B5A63]">Se încarcă workspace-ul tău</p>
              </div>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block w-full lg:max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Caută după nume, email sau id"
                    className="w-full rounded-2xl border border-black/5 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-[0_6px_16px_rgba(31,23,32,0.04)] outline-none transition placeholder:text-gray-400 focus:border-(--color-soft) focus:bg-white"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Toți</FilterButton>
                  <FilterButton active={statusFilter === "Active"} onClick={() => setStatusFilter("Active")}>Activi</FilterButton>
                  <FilterButton active={statusFilter === "Paused"} onClick={() => setStatusFilter("Paused")}>Pauzați</FilterButton>
                  <FilterButton active={statusFilter === "Invited"} onClick={() => setStatusFilter("Invited")}>Invitați</FilterButton>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            </div>
          </section>
        ) : error ? (
          <div className="rounded-[28px] sm:rounded-4xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">{error}</div>
        ) : (
          <section
            className="rounded-[28px] sm:rounded-4xl border border-black/5 shadow-sm overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
            }}
          >
            <div className="p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Lista de clienți</h2>
                <p className="mt-1 text-sm text-[#6B5A63]">
                  {filtered.length} rezultate afișate
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block w-full lg:max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Caută după nume, email sau id"
                    className="w-full rounded-2xl border border-black/5 bg-white/90 py-3 pl-11 pr-11 text-sm text-slate-900 shadow-[0_6px_16px_rgba(31,23,32,0.04)] outline-none transition placeholder:text-gray-400 focus:border-(--color-soft) focus:bg-white"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-(--color-card) hover:text-slate-700"
                      aria-label="Șterge căutarea"
                    >
                      <XIcon />
                    </button>
                  ) : null}
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Toți</FilterButton>
                  <FilterButton active={statusFilter === "Active"} onClick={() => setStatusFilter("Active")}>Activi</FilterButton>
                  <FilterButton active={statusFilter === "Paused"} onClick={() => setStatusFilter("Paused")}>Pauzați</FilterButton>
                  <FilterButton active={statusFilter === "Invited"} onClick={() => setStatusFilter("Invited")}>Invitați</FilterButton>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              {clients.length === 0 ? (
                <div className="rounded-[28px] sm:rounded-4xl border border-dashed border-black/10 bg-white/85 p-10 text-center shadow-[0_6px_16px_rgba(31,23,32,0.04)]">
                  <h3 className="text-sm font-semibold text-gray-900">Încă nu ai clienți</h3>
                  <p className="mt-2 text-sm text-[#6B5A63]">
                    Începe prin a adăuga primul client
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAdd}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                  >
                    <PlusIcon />
                    Adaugă client
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[28px] sm:rounded-4xl border border-dashed border-black/10 bg-white/85 p-10 text-center shadow-[0_6px_16px_rgba(31,23,32,0.04)]">
                  <h3 className="text-sm font-semibold text-gray-900">Nu există clienți potriviți</h3>
                  <p className="mt-2 text-sm text-[#6B5A63]">
                    Încearcă altă căutare sau resetează filtrele.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      Șterge căutarea
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      Resetează filtrele
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((client) => (
                    <ClientRowCard
                      key={client.id}
                      therapistId={therapistId}
                      client={client}
                      onToggleStatus={() => onToggleStatus(client.id)}
                      onRemove={() => onRemove(client.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="mx-auto mt-24 w-[92%] max-w-lg rounded-[28px] bg-white shadow-xl border border-gray-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Adaugă client</h3>
                <p className="mt-1 text-sm text-gray-600">Creează o nouă intrare</p>
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
            <div className="space-y-4 px-6 py-5">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Email client</span>
                <input
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="ex: client@email.com"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Nume (opțional)</span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="ex: Ana M."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Renunță
                </button>
                <button
                  type="button"
                  onClick={onAddClient}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Adaugă
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CompactStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white/85 px-3 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5">
      <p className="text-[11px] font-medium text-[#6B5A63]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}


function LoadingCard() {
  return <div className="h-40 rounded-[28px] border border-black/5 bg-white/85 shadow-[0_6px_16px_rgba(31,23,32,0.04)]" />;
}

function ClientRowCard({
  therapistId,
  client,
  onToggleStatus,
  onRemove,
}: {
  therapistId: string;
  client: Client;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  const initials = initialsFromName(client.name);
  const status = client.status ?? (client.kind === "invite" ? "Invited" : "Active");
  // Romanian translations for statuses
  const statusLabel =
    status === "Active"
      ? "Activ"
      : status === "Paused"
      ? "Pauzat"
      : "Invitat";
  return (
    <div className="group relative rounded-[28px] border border-black/5 bg-white/90 p-5 shadow-[0_6px_16px_rgba(31,23,32,0.04)] transition hover:-translate-y-px hover:shadow-[0_10px_22px_rgba(31,23,32,0.06)]">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-card) text-sm font-semibold text-(--color-primary) ring-1 ring-black/5">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{client.name}</p>
            <p className="truncate text-xs text-gray-500">{client.email || "Email indisponibil"}</p>
            <p className="mt-1 text-xs text-gray-500">Ultima ședință: {client.lastSession ?? "—"}</p>
          </div>
        </div>
        <span
          className={
            "shrink-0 inline-flex min-h-7 items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 " +
            (status === "Active"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : status === "Invited"
              ? "bg-amber-50 text-amber-700 ring-amber-100"
              : "bg-gray-50 text-gray-700 ring-gray-200")
          }
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-5">
        <div className="flex flex-col gap-2.5 sm:hidden">
          {client.kind === "linked" ? (
            <Link
              href={`/therapist/${therapistId}/clients/${client.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-(--color-accent) px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Deschide profilul
            </Link>
          ) : null}
          {client.kind === "linked" ? (
            <button
              type="button"
              onClick={onToggleStatus}
              className="inline-flex w-full items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
            >
              {status === "Active" ? "Pauză" : "Activează"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
            aria-label={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
            title={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
          >
            {client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
          </button>
        </div>
        <div className="hidden items-center justify-end sm:flex xl:hidden">
          <details className="relative">
            <summary
              className="list-none inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 [&::-webkit-details-marker]:hidden"
              aria-label="Mai mult"
            >
              Mai mult
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
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
              <div className="py-1">
                {client.kind === "linked" ? (
                  <Link
                    href={`/therapist/${therapistId}/clients/${client.id}`}
                    onClick={(e) => {
                      (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gray-500" aria-hidden="true">
                      <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    Deschide profilul
                  </Link>
                ) : null}
                {client.kind === "linked" ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
                      onToggleStatus();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gray-500" aria-hidden="true">
                      <path d="M10 9v6M14 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    {status === "Active" ? "Pauză" : "Activează"}
                  </button>
                ) : null}
                <div className="my-1 h-px bg-gray-100" />
                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
                    onRemove();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  aria-label={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
                  title={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-rose-600" aria-hidden="true">
                    <path d="M6 7h12M10 11v7M14 11v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 7l1-2h4l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M7 7l1 14h8l1-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
                </button>
              </div>
            </div>
          </details>
        </div>
        <div className="hidden items-center justify-end gap-2 xl:flex">
          {client.kind === "linked" ? (
            <Link
              href={`/therapist/${therapistId}/clients/${client.id}`}
              className="min-h-10 min-w-18 inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Deschide
            </Link>
          ) : null}
          {client.kind === "linked" ? (
            <button
              type="button"
              onClick={onToggleStatus}
              className="min-h-10 min-w-18 inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
            >
              {status === "Active" ? "Pauză" : "Activează"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="min-h-10 min-w-18 inline-flex items-center justify-center rounded-xl border border-(--color-soft) bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
            aria-label={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
            title={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
          >
            {client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
          </button>
        </div>
      </div>
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
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition " +
        (active
          ? "border-(--color-soft) bg-(--color-card) text-(--color-accent)"
          : "border-black/5 bg-white/85 text-gray-700 hover:bg-white")
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}