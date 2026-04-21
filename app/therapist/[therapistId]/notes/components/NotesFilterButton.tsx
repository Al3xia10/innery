import * as React from "react";

export default function NotesFilterButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition " +
        (active
          ? "border-(--color-soft) bg-(--color-card) text-(--color-primary)"
          : "border-black/5 bg-white/85 text-gray-700 hover:bg-white")
      }
    >
      {icon}
      {children}
    </button>
  );
}
