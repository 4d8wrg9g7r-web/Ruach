"use client";

import { Textarea } from "./ui/Input";
import { SubmitButton } from "./SubmitButton";
import { useToast } from "./ui/Toast";

interface QuestionForwardingFormProps {
  emails: string[];
  /** Shown under the field -- the org-wide form and a campus override explain different fallbacks. */
  hint: string;
  action: (formData: FormData) => Promise<void>;
}

/** Staff inboxes for the chat widget's "Forward to staff" offer on unanswered questions. */
export function QuestionForwardingForm({ emails, hint, action }: QuestionForwardingFormProps) {
  const { showToast } = useToast();

  async function handleSave(formData: FormData) {
    try {
      await action(formData);
      showToast("Forwarding emails saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong. Please try again.", "error");
    }
  }

  return (
    <form action={handleSave} className="flex flex-col gap-4">
      <label className="text-sm text-ink-secondary">
        Forward unanswered questions to (one per line)
        <Textarea
          name="questionForwardingEmails"
          placeholder="staff@yourchurch.org"
          defaultValue={emails.join("\n")}
          rows={3}
          className="mt-1 block w-full max-w-sm"
        />
        <span className="mt-1 block text-xs text-ink-muted">{hint}</span>
      </label>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
      </div>
    </form>
  );
}
