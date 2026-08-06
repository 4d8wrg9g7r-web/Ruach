import { getEmailProvider } from "@ruach/email";

/**
 * Shared by both signup paths (access-code and Stripe checkout) since they'd
 * otherwise duplicate identical copy. Best-effort -- a failed/slow welcome email
 * must never surface as a broken signup; the org (and payment, if any) has already
 * succeeded by the time this is called.
 */
export async function sendWelcomeEmail(params: { to: string; organizationName: string }): Promise<void> {
  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  try {
    await getEmailProvider().sendEmail({
      to: params.to,
      subject: `Welcome to Ruach, ${params.organizationName}!`,
      text: `${params.organizationName} is all set up on Ruach.\n\nHead to your dashboard: ${appOrigin}/dashboard\n\nNew here? The Getting Started guide walks through adding a website, creating a widget, and importing your first resource: ${appOrigin}/getting-started\n\nQuestions? Reach us at hello@ruachplatform.com.`,
    });
  } catch (err) {
    console.error(`Failed to send welcome email to ${params.to}:`, err);
  }
}
