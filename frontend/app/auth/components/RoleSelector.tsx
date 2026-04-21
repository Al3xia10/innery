"use client";

type Role = "therapist" | "client";

export default function RoleSelector({
  role,
  onChange,
}: {
  role: Role;
  onChange: (next: Role) => void;
}) {
  return (
    <fieldset className="mb-6">
      <legend className="sr-only">Selectează rolul</legend>
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
          <input
            type="radio"
            name="role"
            value="therapist"
            checked={role === "therapist"}
            onChange={() => onChange("therapist")}
            className="accent-(--color-accent)"
          />
          Terapeut
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === "client"}
            onChange={() => onChange("client")}
            className="accent-(--color-accent)"
          />
          Client
        </label>
      </div>
    </fieldset>
  );
}
