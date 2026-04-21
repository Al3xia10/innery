"use client";

import * as React from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = React.useState<T>(initialValue);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      setState(JSON.parse(raw) as T);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}