import * as React from "react";

type SessionStatus = "Scheduled" | "Completed" | "Canceled" | "NoShow";

function statusPillClass(status: SessionStatus) {
  switch (status) {
    case "Scheduled":
      return "bg-indigo-50 text-indigo-700 ring-indigo-100";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Canceled":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    case "NoShow":
      return "bg-amber-50 text-amber-800 ring-amber-100";
  }
}

function statusLabel(status: SessionStatus) {
  switch (status) {
    case "Scheduled":
      return "Programată";
    case "Completed":
      return "Finalizată";
    case "Canceled":
      return "Anulată";
    case "NoShow":
      return "Neprezentare";
  }
}

function typeLabel(type: string) {
  if (type === "Individual") return "Individuală";
  if (type === "Couple") return "Cuplu";
  if (type === "Group") return "Grup";
  return type;
}

function SessionCard({
  clientName,
  date,
  status,
  type,
  selected,
  onClick,
}: {
  clientName: string;
  date: string;
  status: SessionStatus;
  type: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-[20px] border px-4 py-4 text-left shadow-[0_10px_24px_rgba(31,23,32,0.06)] transition",
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

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[1.02rem] font-semibold tracking-tight text-gray-900">{clientName}</div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{date}</div>
        </div>

        <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold shadow-[0_3px_8px_rgba(31,23,32,0.04)] ring-1 ${statusPillClass(status)}`}>
          {statusLabel(status)}
        </span>
      </div>

      <div className="mt-3 text-xs text-[#6B5A63]">{typeLabel(type)}</div>
    </button>
  );
}

export default React.memo(SessionCard);
