"use client";

import * as React from "react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  push: (
    kind: ToastKind,
    message: string,
    opts?: { actionLabel?: string; onAction?: () => void }
  ) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string, opts?: { actionLabel?: string; onAction?: () => void }) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function AppToast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const [shown, setShown] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  React.useEffect(() => {
    if (item.onAction) return;
    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 2600);

    const closeTimer = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(closeTimer);
    };
  }, [item.onAction, onClose]);

  return (
    <div
      role="status"
      className={cn(
        "w-[min(92vw,380px)] rounded-[18px] border border-black/5 bg-white p-3 shadow-[0_14px_40px_rgba(31,23,32,0.12)] transition-all duration-300 ease-out sm:rounded-[22px] sm:p-4",
        shown && !leaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        item.kind === "error"
          ? "border-rose-200"
          : item.kind === "success"
            ? "border-emerald-200"
            : "border-(--color-soft)"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-2 w-2 rounded-full",
            item.kind === "error"
              ? "bg-rose-500"
              : item.kind === "success"
                ? "bg-emerald-500"
                : "bg-(--color-primary)"
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-foreground">
            {item.kind === "error" ? "Eroare" : item.kind === "success" ? "Succes" : "Info"}
          </p>
          <p className="mt-0.5 text-sm leading-6 text-(--color-foreground-muted,#6B5A63) sm:leading-relaxed">
            {item.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-[14px] border border-transparent transition hover:border-black/5 hover:bg-(--color-soft)"
          aria-label="Închide"
          title="Închide"
        >
          <span className="text-[#6B5A63]">✕</span>
        </button>
      </div>
      {item.onAction && item.actionLabel ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              item.onAction?.();
              onClose();
            }}
            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-(--color-soft)"
          >
            {item.actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = React.useCallback(
    (
      kind: ToastKind,
      message: string,
      opts?: { actionLabel?: string; onAction?: () => void }
    ) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      setItems((prev) => [
        ...prev,
        { id, kind, message, actionLabel: opts?.actionLabel, onAction: opts?.onAction },
      ]);
    },
    []
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      push,
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message, opts) => push("info", message, opts),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-auto sm:right-4 sm:top-4 sm:left-auto sm:translate-x-0 sm:items-end">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <AppToast item={item} onClose={() => remove(item.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
