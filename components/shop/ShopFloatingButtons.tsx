"use client";

// Placeholder: the previous floating chat-tray hardcoded the same fake
// phone number (`tel:0000000000`) and a generic `https://line.me`
// link for every store, plus a Messenger pill, which made buyers think
// the store had those channels even when the operator hadn't
// configured any of them. Until per-store contact channels live on
// Store and we surface only the channels the operator has filled in,
// render nothing. Callers that pass `primaryColor` still type-check
// — the prop is intentionally unused.
export function ShopFloatingButtons(_props: { primaryColor?: string }) {
  return null;
}
