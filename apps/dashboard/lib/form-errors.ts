/**
 * Shared return shape for a multi-field Server Action that wants per-field
 * validation errors shown inline, not just a generic toast. A thrown Error's custom
 * properties don't survive the server/client serialization boundary -- only
 * `.message` does -- so structured field errors have to come back as a normal
 * return value instead of being thrown. Reserve throwing for genuinely unexpected
 * failures (no session, a service call that shouldn't fail); return this shape for
 * "the user needs to fix something in this form." See AddWebsiteForm.tsx for the
 * reference implementation of the client side of this pattern.
 */
export interface FormActionResult {
  /** A form-wide message not tied to one specific field (e.g. "You've reached your plan's website limit"). */
  formError?: string;
  /** Keyed by field `name`. */
  fieldErrors?: Record<string, string>;
}
