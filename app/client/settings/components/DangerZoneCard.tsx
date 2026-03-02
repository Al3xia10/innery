export function DangerZoneCard({
  onToast,
}: {
  onToast?: (msg: string) => void;
}) {
  return (
    <div
      className="rounded-3xl border border-black/5 shadow-sm p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
    >
      <h2 className="text-sm font-semibold text-gray-900">Account & data</h2>
      <p className="mt-2 text-sm text-gray-600">
        If you choose to leave, you can permanently delete your account and all associated data.
      </p>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs text-gray-500">Demo action • does not change data</div>
        <button
          type="button"
          onClick={() => onToast?.("Delete account (demo)")}
          className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
        >
          Delete my account
        </button>
      </div>
    </div>
  );
}