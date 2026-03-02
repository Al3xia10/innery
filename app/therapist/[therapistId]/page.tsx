"use client";

export default function TherapistDashboard() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div
        className="max-w-xl w-full rounded-3xl border border-black/5 shadow-sm p-8 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
        }}
      >
        <div className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1">
          Coming soon
        </div>

        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Therapist workspace is under construction
        </h1>

        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          The therapist interface is currently being developed.
          I am focusing first on creating a safe, calm and intuitive
          experience for clients, and the therapist space will follow.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Thank you for your patience 🤍
        </p>
      </div>
    </section>
  );
}
