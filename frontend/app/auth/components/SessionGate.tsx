"use client";

export default function SessionGate({
  sessionNotice,
  sessionNoticeProgress,
  showSessionLoader,
}: {
  sessionNotice: string | null;
  sessionNoticeProgress: number;
  showSessionLoader: boolean;
}) {
  return (
    <section className="min-h-screen bg-(--color-card)/40 px-4 py-12">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        {sessionNotice ? (
          <div className="w-full max-w-md rounded-3xl border border-(--color-soft) bg-white px-5 py-4 shadow-[0_18px_40px_rgba(31,23,32,0.14)] ring-1 ring-(--color-soft)">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-soft) text-(--color-primary)">
                <span className="text-base font-semibold">i</span>
              </div>
              <div className="w-full">
                <p className="text-sm font-semibold text-slate-900">Notificare acces</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{sessionNotice}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-(--color-card)">
                  <div
                    className="h-full rounded-full bg-(--color-accent) transition-[width] duration-75 ease-linear"
                    style={{ width: `${sessionNoticeProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-(--color-primary)">
                  Redirecționare imediată...
                </p>
              </div>
            </div>
          </div>
        ) : showSessionLoader ? (
          <div className="flex items-center gap-3 rounded-2xl border border-(--color-soft) bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-(--color-soft) border-t-(--color-accent)" />
            <span>Verificăm sesiunea ta...</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
