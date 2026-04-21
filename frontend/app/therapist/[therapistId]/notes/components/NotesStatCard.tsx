export default function NotesStatCard({
  title,
  value,
  subtitle,
  className = "",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={`rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm ${className}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">{title}</p>
      <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{value}</p>
      <p className="mt-1.5 text-xs text-[#6B5A63]">{subtitle}</p>
    </div>
  );
}
