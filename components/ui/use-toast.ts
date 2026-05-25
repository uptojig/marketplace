"use client";

import * as React from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** ms before auto-dismiss; pass Infinity to keep it until closed. */
  duration?: number;
}

const MAX_TOASTS = 4;

// Module-level store so `toast()` can be called imperatively from anywhere
// (event handlers, non-component utils) — not just inside a hook. Radix Toast
// owns the actual timing/pause-on-hover; we just hold the queue.
let store: ToastItem[] = [];
const listeners = new Set<(toasts: ToastItem[]) => void>();

function emit() {
  for (const listener of listeners) listener(store);
}

export function dismissToast(id: string) {
  store = store.filter((t) => t.id !== id);
  emit();
}

export function toast(input: Omit<ToastItem, "id"> & { id?: string }): string {
  const id = input.id ?? Math.random().toString(36).slice(2);
  store = [{ ...input, id }, ...store.filter((t) => t.id !== id)].slice(0, MAX_TOASTS);
  emit();
  return id;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(store);
  React.useEffect(() => {
    listeners.add(setToasts);
    setToasts(store);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);
  return { toasts, toast, dismiss: dismissToast };
}
