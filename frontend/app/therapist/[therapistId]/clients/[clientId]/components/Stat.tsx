export default function Stat({
  label,
  value,
  valueClassName = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[20px] border border-black/5 bg-white/90 p-4 shadow-[0_6px_16px_rgba(31,23,32,0.04)] sm:rounded-[28px] sm:p-5">
      <p className="text-sm leading-5 text-[#6B5A63] sm:leading-6">{label}</p>
      <p className={`mt-1.5 text-[1.6rem] font-semibold leading-none ${valueClassName} sm:mt-2 sm:text-2xl`}>{value}</p>
    </div>
  );
}
