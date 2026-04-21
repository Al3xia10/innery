export default function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-black/10 bg-(--color-card) p-4 shadow-[0_4px_12px_rgba(31,23,32,0.03)] sm:rounded-[28px] sm:p-6">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-6 sm:leading-7 text-[#6B5A63]">{text}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
