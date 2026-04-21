import Link from "next/link";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "C";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

export default function ProfileTopBar({
  displayClientName,
  displayTherapistName,
  therapistId,
  onViewSessions,
}: {
  displayClientName: string;
  displayTherapistName: string;
  therapistId: string;
  onViewSessions: () => void;
}) {
  return (
    <section
      className="overflow-hidden rounded-[20px] border border-black/5 shadow-sm sm:rounded-[28px]"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
      }}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-(--color-card) text-sm font-semibold text-(--color-primary) ring-1 ring-black/5 sm:rounded-[20px]">
              <span suppressHydrationWarning>{initialsFromName(displayClientName)}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="w-full text-[1.75rem] font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-[2.3rem]" suppressHydrationWarning>
                  {displayClientName}
                </h1>
              </div>
              <p className="text-sm text-[#6B5A63]">
                Terapeut alocat:{" "}
                <span className="font-semibold text-slate-900" suppressHydrationWarning>
                  {displayTherapistName}
                </span>
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 sm:leading-7 text-[#6B5A63] sm:text-[15px]">
            Revizuiește notițele, ședințele și statusul actual al acestui client într-un singur spațiu organizat.
          </p>
        </div>

        <div className="mt-4 grid w-full grid-cols-2 gap-2.5 self-start sm:mt-5 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Link
            href={`/therapist/${therapistId}/clients`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] border border-black/5 bg-white/85 px-4 py-3 text-center text-sm font-semibold leading-5 text-slate-700 shadow-sm transition hover:bg-white sm:min-w-36 sm:w-auto sm:rounded-[22px] sm:px-5"
            aria-label="Înapoi la clienți"
            title="Înapoi la clienți"
          >
            Înapoi la clienți
          </Link>

          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-(--color-accent) px-4 py-3 text-center text-sm font-semibold leading-5 text-white shadow-sm transition hover:opacity-90 sm:min-w-36 sm:w-auto sm:whitespace-nowrap sm:rounded-[22px] sm:px-5"
            onClick={onViewSessions}
          >
            Vezi ședințele
          </button>
        </div>
      </div>
    </section>
  );
}
