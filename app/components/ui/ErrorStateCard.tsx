"use client";

export default function ErrorStateCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
      {message}
    </div>
  );
}

