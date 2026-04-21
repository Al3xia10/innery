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

export default function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusPillClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}
