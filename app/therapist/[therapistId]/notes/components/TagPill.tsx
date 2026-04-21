type NoteTag = "Today" | "Yesterday" | "3 days ago" | "Individual session" | "Couple session" | "Draft";

export default function TagPill({ tag }: { tag: NoteTag }) {
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
