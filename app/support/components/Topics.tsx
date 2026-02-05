const topics = [
  {
    title: "Client not found / Therapist not found",
    text: "In demo mode, pages rely on mock IDs. Make sure your URL uses an existing id (ex: /therapist/t1, /client/c1).",
  },
  {
    title: "Notes & reflections not showing",
    text: "Check if the client is linked to that therapist ID in mock data. In real backend, this becomes a permission rule.",
  },
  {
    title: "Navigation issues on mobile",
    text: "If the dashboard dock overlaps, we can tune spacing and stacking so navbar + sidebar coexist cleanly.",
  },
  {
    title: "Privacy & boundaries",
    text: "Innery is designed for therapist-controlled spaces. If you need a different client visibility model, we can map it.",
  },
];

export default function Topics() {
  return (
    <div className="mt-10">
      <div className="max-w-2xl">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Common topics
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
          The things that usually block progress when building the Innery MVP.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <div
            key={t.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}