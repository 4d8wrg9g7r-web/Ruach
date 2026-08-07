import { formService, outboxService, type ClaimedEvent, type HandlerRegistry } from "@ruach/database";
import { getEmailProvider } from "@ruach/email";
import { workflowTriggerHandler } from "./workflow-runner";

/**
 * The outbox handler registry lives in the app (not the database package) because
 * handlers perform external effects -- email, and later cross-module actions -- that the
 * data layer must not depend on. The generic claim/retry/idempotency orchestration lives
 * in outboxService.drain; this file only supplies the handlers and a drain entry point.
 *
 * As the workflow engine (§39) lands, it registers its own handlers here.
 */

interface FormSubmittedPayload {
  formId: string;
  submissionId: string;
  version: number;
  submitterEmail: string | null;
  submitterName: string | null;
}

/**
 * FormSubmitted -> email the form's configured notification addresses. Idempotent by
 * construction (the outbox records ProcessedEvent per handler), and a no-op when the form
 * has no notification addresses. Reads the form through the tenant-scoped service using
 * the event's own organization context.
 */
const notifyFormSubmission = {
  name: "notify-form-submission",
  async run(event: ClaimedEvent) {
    const payload = event.payload as FormSubmittedPayload;
    const form = await formService.getForm(event.organizationId, payload.formId);
    if (!form || form.notificationEmails.length === 0) return;

    const from = payload.submitterName || payload.submitterEmail || "Someone";
    await Promise.all(
      form.notificationEmails.map((to) =>
        getEmailProvider().sendEmail({
          to,
          subject: `New submission: ${form.title}`,
          text: `${from} submitted "${form.title}".\n\nView it in the dashboard under Forms → ${form.title} → Submissions.`,
        }),
      ),
    );
  },
};

export const HANDLERS: HandlerRegistry = {
  FormSubmitted: [notifyFormSubmission, workflowTriggerHandler],
  PersonCreated: [workflowTriggerHandler],
};

/** Drain due outbox events once, using the app's handler registry. */
export function drainOutbox(opts?: { batchSize?: number }) {
  return outboxService.drain(HANDLERS, opts);
}
