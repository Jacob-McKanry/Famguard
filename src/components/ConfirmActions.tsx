"use client";

import { useState } from "react";

// The two choices on the stage-two page: confirm, or say what price would work.
export default function ConfirmActions({ token, alreadyConfirmed }: { token: string; alreadyConfirmed: boolean }) {
  const [confirmed, setConfirmed] = useState(alreadyConfirmed);
  const [showFeedback, setShowFeedback] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(payload: Record<string, string>) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); return false; }
      return true;
    } catch {
      setError("We could not reach the server. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {confirmed ? (
        <p className="big-line" role="status"><strong>Your spot is confirmed. Thank you.</strong></p>
      ) : (
        <button type="button" className="btn btn-green btn-cta" disabled={busy}
          onClick={async () => { if (await post({ action: "confirm" })) setConfirmed(true); }}>
          Confirm my spot
        </button>
      )}

      <div style={{ marginTop: 24 }}>
        {sent ? (
          <p role="status">Thank you. We read every reply.</p>
        ) : showFeedback ? (
          <form onSubmit={async (e) => { e.preventDefault(); if (text.trim() && await post({ action: "feedback", text })) setSent(true); }}>
            <label htmlFor="price-feedback" className="sr-only">What price would work for you?</label>
            <div className="share-row">
              <input id="price-feedback" className="input" type="text" maxLength={1000} value={text}
                onChange={(e) => setText(e.target.value)} placeholder="What would work for you?" />
              <button type="submit" className="btn btn-outline" disabled={busy || !text.trim()}>Send</button>
            </div>
          </form>
        ) : (
          <p style={{ margin: 0 }}>
            This price doesn&apos;t work for us.{" "}
            <button type="button" onClick={() => setShowFeedback(true)}
              style={{ background: "none", border: 0, padding: 0, font: "inherit", color: "#2f5d46", textDecoration: "underline", cursor: "pointer" }}>
              Tell us what would.
            </button>
          </p>
        )}
      </div>
      {error && <p className="error-msg" role="alert">{error}</p>}
    </div>
  );
}
