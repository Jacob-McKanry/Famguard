"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";
import { DEPOSIT_DOLLARS } from "@/config";

// Invisible. On return from a successful Stripe Checkout (?paid=1) it fires the Purchase event.
export default function PurchaseTracker() {
  useEffect(() => {
    track("Purchase", { value: DEPOSIT_DOLLARS, currency: "USD" });
  }, []);
  return null;
}
