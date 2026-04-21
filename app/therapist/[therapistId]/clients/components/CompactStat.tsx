export default function CompactStat({
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
    <div className={`rounded-[20px] bg-white/80 px-3 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm sm:px-4 sm:py-3.5 sm:rounded-3xl ${className}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63] sm:text-[11px]">{title}</p>
      <p className="mt-1.5 text-[1.2rem] font-semibold leading-none text-slate-900 sm:mt-2 sm:text-[1.3rem]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#6B5A63] sm:mt-1.5">{subtitle}</p>
    </div>
  );
}
