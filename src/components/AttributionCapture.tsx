"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

// Invisible. On every page load it saves ?src= and ?utm_ values for later.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
