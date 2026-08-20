import type { EmailProvider, SendEmailInput } from "./EmailProvider";

/**
 * No real email provider is wired up yet (explicit product decision -- prayer-wall
 * notifications and forwarding are built end-to-end against this stub so the feature
 * works today and a real provider is a contained swap later, not a rewrite). Logs
 * instead of sending, so nothing here makes a network call or requires credentials.
 */
export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(input: SendEmailInput): Promise<void> {
    const replyTo = input.replyTo ? ` replyTo=${input.replyTo}` : "";
    console.log(`[email stub] to=${input.to}${replyTo} subject="${input.subject}"\n${input.text}`);
  }
}
