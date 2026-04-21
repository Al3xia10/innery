export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-6xl animate-pulse space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-4xl border border-black/5 bg-white p-6 shadow-[0_8px_24px_rgba(31,23,32,0.06)] sm:p-10">
        <div className="h-9 w-2/3 rounded-xl bg-gray-200/80" />
        <div className="mt-4 h-4 w-5/6 rounded-xl bg-gray-200/60" />
        <div className="mt-2 h-4 w-2/3 rounded-xl bg-gray-200/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_6px_16px_rgba(31,23,32,0.05)]"
          >
            <div className="h-5 w-1/2 rounded-xl bg-gray-200/80" />
            <div className="mt-3 h-4 w-full rounded-xl bg-gray-200/60" />
            <div className="mt-2 h-4 w-5/6 rounded-xl bg-gray-200/60" />
          </div>
        ))}
      </div>
    </section>
  );
}
