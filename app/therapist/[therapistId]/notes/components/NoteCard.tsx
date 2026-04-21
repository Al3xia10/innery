import * as React from "react";

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
        "group relative w-full overflow-hidden rounded-[20px] border px-4 py-4 text-left shadow-[0_10px_24px_rgba(31,23,32,0.06)] transition cursor-pointer",
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

      <h3 className="mb-1 truncate text-[1.02rem] font-semibold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{date}</p>
      <p className="line-clamp-2 text-[14px] leading-7 text-gray-700">{preview}</p>
    </button>
  );
}

export default React.memo(NoteCard);
