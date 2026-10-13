import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email();

/** Upper bound so a pasted mailing list doesn't turn one visitor tap into a mass send. */
export const MAX_QUESTION_FORWARDING_EMAILS = 10;

/** Parses the one-per-line textarea from QuestionForwardingForm; throws a user-facing message on bad input. */
export function parseQuestionForwardingEmails(formData: FormData): string[] {
  const raw = String(formData.get("questionForwardingEmails") ?? "")
    .split("\n")
    .map((e) => e.trim())
    .filter(Boolean);
  const emails: string[] = [];
  for (const entry of raw) {
    const parsed = emailSchema.safeParse(entry);
    if (!parsed.success) throw new Error(`"${entry}" isn't a valid email address.`);
    if (!emails.includes(parsed.data)) emails.push(parsed.data);
  }
  if (emails.length > MAX_QUESTION_FORWARDING_EMAILS) {
    throw new Error(`You can forward to up to ${MAX_QUESTION_FORWARDING_EMAILS} addresses.`);
  }
  return emails;
}
