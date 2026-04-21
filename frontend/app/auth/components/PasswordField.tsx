"use client";

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  minLength,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <div>
      {label ? <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label> : null}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50"
          aria-label={show ? "Ascunde parola" : "Arată parola"}
        >
          <img
            src={show ? "/hide.png" : "/show.png"}
            alt="toggle visibility"
            className="h-4 w-4 object-contain"
          />
        </button>
      </div>
    </div>
  );
}
