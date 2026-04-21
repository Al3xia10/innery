import * as React from "react";

export default function TabButton({
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
      className={[
        "inline-flex min-h-10 items-center justify-center rounded-[18px] px-3 py-2 text-sm font-semibold transition sm:px-3.5 sm:py-2.5",
        active
          ? "bg-(--color-accent) text-white shadow-sm"
          : "bg-(--color-card) text-gray-700 hover:bg-(--color-soft) hover:shadow-sm",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
