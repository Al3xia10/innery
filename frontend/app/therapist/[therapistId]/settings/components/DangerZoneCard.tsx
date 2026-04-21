export function DangerZoneCard({
  onToast,
}: {
  onToast?: (msg: string) => void;
}) {
  return (
    <div
      className="rounded-[28px] border border-black/5 p-4 shadow-[0_10px_24px_rgba(31,23,32,0.05)] sm:rounded-4xl sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,250,251,0.95) 100%)",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
        Zonă sensibilă
      </p>
      <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight text-foreground">
        Cont & date personale
      </h2>
      <p className="mt-2 text-sm leading-6 sm:leading-7 text-[#74656d]">
        Poți șterge definitiv contul și toate datele asociate.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-[#8a7b84]">Acțiune demo • nu modifică datele</div>
        <button
          type="button"
          onClick={() => onToast?.("Ștergere cont (demo)")}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-[18px] border border-rose-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 sm:w-auto sm:px-5"
        >
          Șterge contul
        </button>
      </div>
    </div>
  );
}