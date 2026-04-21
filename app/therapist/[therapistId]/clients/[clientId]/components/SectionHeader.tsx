export default function SectionHeader({
  title,
  description,
  countText,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  countText: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">{description}</p>
        <p className="mt-1.5 text-xs leading-5 text-[#6B5A63]">{countText}</p>
      </div>
      <button
        type="button"
        className="inline-flex min-h-10 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}
