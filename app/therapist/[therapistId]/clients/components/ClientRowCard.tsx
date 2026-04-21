import Link from "next/link";

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

export default function ClientRowCard({
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
  const statusLabel =
    status === "Active"
      ? "Activ"
      : status === "Paused"
        ? "Pauzat"
        : "Invitat";

  return (
    <div className="group relative rounded-[20px] border border-black/5 bg-white/90 p-4 shadow-[0_6px_16px_rgba(31,23,32,0.04)] transition hover:-translate-y-px hover:shadow-[0_10px_22px_rgba(31,23,32,0.06)] sm:rounded-[28px] sm:p-5">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-(--color-card) text-sm font-semibold text-(--color-primary) ring-1 ring-black/5 sm:rounded-full">
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
            "shrink-0 inline-flex min-h-7 items-center rounded-[18px] px-3 py-1 text-[11px] font-semibold ring-1 sm:rounded-full " +
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
              className="inline-flex w-full items-center justify-center rounded-[18px] bg-(--color-accent) px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Deschide profilul
            </Link>
          ) : null}
          {client.kind === "linked" ? (
            <button
              type="button"
              onClick={onToggleStatus}
              className="inline-flex w-full items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
            >
              {status === "Active" ? "Pauză" : "Activează"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex w-full items-center justify-center rounded-[18px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
            aria-label={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
            title={client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
          >
            {client.kind === "invite" ? "Șterge invitația" : "Deconectează"}
          </button>
        </div>
        <div className="hidden items-center justify-end sm:flex xl:hidden">
          <details className="relative">
            <summary
              className="list-none inline-flex cursor-pointer select-none items-center gap-2 rounded-[18px] border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 [&::-webkit-details-marker]:hidden"
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
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-lg">
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
        <div className="hidden min-w-0 items-center justify-end gap-2 xl:flex">
          {client.kind === "linked" ? (
            <Link
              href={`/therapist/${therapistId}/clients/${client.id}`}
              className="inline-flex h-10 min-w-0 shrink items-center justify-center rounded-[18px] bg-(--color-accent) px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(239,135,192,0.18)] transition hover:opacity-90"
            >
              Deschide
            </Link>
          ) : null}
          {client.kind === "linked" ? (
            <button
              type="button"
              onClick={onToggleStatus}
              className="inline-flex h-10 min-w-0 shrink items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-xs font-semibold text-gray-700 shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-(--color-soft)"
            >
              {status === "Active" ? "Pauză" : "Activează"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-10 min-w-0 shrink items-center justify-center rounded-[18px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-rose-100"
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
