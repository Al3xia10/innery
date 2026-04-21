export type Visibility = "private" | "shared";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toNiceDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfThatDay.getTime()) / 86400000);

  const time = d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Azi, ${time}`;
  if (diffDays === 1) return `Ieri, ${time}`;

  return d.toLocaleString("ro-RO", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}