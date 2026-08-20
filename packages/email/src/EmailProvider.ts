/**
 * The email seam (mirrors packages/ai/src/AIProvider.ts's role for the AI seam).
 * ConsoleEmailProvider is the only implementation today -- see getEmailProvider() in
 * index.ts -- but every call site goes through this interface so a real provider
 * (Resend, Postmark, SES, SMTP) can be swapped in later without touching callers.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  /** When a recipient hits "reply," their email client addresses it here instead of the `to` address above (which is a shared noreply@ sender). Used for staff replies that should land in the sender's own inbox, not Ruach's. */
  replyTo?: string;
}

export interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<void>;
}
