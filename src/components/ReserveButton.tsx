"use client";

import { useState } from "react";
import { track } from "@/lib/track";
import { DEPOSIT_DOLLARS } from "@/config";

// "Reserve my spot for $10": asks the server for a Stripe Checkout page and goes there.
export default function ReserveButton({ sid, stripeReady }: { sid: string | null; stripeReady: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!stripeReady) {
    return (
      <button type="button" className="btn btn-green form-submit" disabled>
        [STRIPE NOT CONNECTED YET]
      </button>
    );
  }

  async function go() {
    setError("");
    setBusy(true);
    track("InitiateCheckout", { value: DEPOSIT_DOLLARS, currency: "USD" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("We could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-green form-submit" onClick={go} disabled={busy || !sid}>
        {busy ? "One moment..." : `Reserve my spot for $${DEPOSIT_DOLLARS}`}
      </button>
      {error && <p className="error-msg" role="alert">{error}</p>}
    </>
  );
}
