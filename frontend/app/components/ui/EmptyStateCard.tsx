"use client";

export default function EmptyStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-(--color-card) p-6 text-center shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-xs text-[#6B5A63]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

