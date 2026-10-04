import { Resend } from "resend";

// Sends the confirmation email (spec section 8). Does nothing, and says so,
// when Resend is not set up. Copy rule: no em dashes.
export async function sendConfirmationEmail(opts: { to: string; firstName: string; planName: string }): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "Resend is not configured" };

  const name = opts.firstName.trim() || "there";
  const text = [
    `Hi ${name},`,
    "",
    "Thanks for joining the Family Guardian early access list.",
    "",
    `The plan you chose: ${opts.planName}.`,
    "",
    "No payment is due until launch, and any deposit is fully refundable. Reply to this email with questions.",
  ].join("\n");
  const html = `<p>Hi ${escapeHtml(name)},</p><p>Thanks for joining the Family Guardian early access list.</p><p>The plan you chose: <strong>${escapeHtml(opts.planName)}</strong>.</p><p>No payment is due until launch, and any deposit is fully refundable. Reply to this email with questions.</p>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: "You're on the Family Guardian early access list.",
      text,
      html,
    });
    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "unknown error" };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
