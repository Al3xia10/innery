import Link from "next/link";

const actions = [
  {
    eyebrow: "Therapists",
    title: "Invite a client",
    text: "Create a client workspace and share access (MVP flow: mock/invite link).",
    href: "/for-therapists",
    cta: "Open therapist guide →",
  },
  {
    eyebrow: "Clients",
    title: "Access your space",
    text: "If you can’t open your dashboard, check your link and client ID (demo).",
    href: "/for-clients",
    cta: "Open client guide →",
  },
  {
    eyebrow: "Account",
    title: "Login issues",
    text: "Wrong redirect, missing ID, or 'not found'? We can help you debug it fast.",
    href: "/auth/login",
    cta: "Go to login →",
  },
];

export default function QuickActions() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
      {actions.map((a) => (
        <div
          key={a.title}
          className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {a.eyebrow}
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">{a.title}</p>

          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.text}</p>

          <Link
            href={a.href}
            className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            {a.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}