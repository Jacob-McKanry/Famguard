"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Read-only box with the site address and a "Copy link" button.
export default function CopyLink() {
  // With no site address configured, fall back to the address in the browser bar.
  const url = useSyncExternalStore(
    () => () => {},
    () => process.env.NEXT_PUBLIC_SITE_URL || window.location.origin,
    () => process.env.NEXT_PUBLIC_SITE_URL || "[YOUR SITE URL]",
  );
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      input.current?.select(); // old browsers: select the text so the person can copy it
      document.execCommand?.("copy");
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="share-row">
      <label className="sr-only" htmlFor="share-url">Site link</label>
      <input id="share-url" ref={input} className="input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="btn btn-gold" onClick={copy}>
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
