export type { EmailProvider, SendEmailInput } from "./EmailProvider";
export { ConsoleEmailProvider } from "./ConsoleEmailProvider";

import type { EmailProvider } from "./EmailProvider";
import { ConsoleEmailProvider } from "./ConsoleEmailProvider";

let cachedProvider: EmailProvider | null = null;

/**
 * Unlike getAIProvider()/getResourceProvider(), this does not branch on an env var --
 * there is no real provider to switch to yet (product decision: ship the feature
 * against a console stub now). When a real provider is chosen, swap the returned
 * instance here (e.g. `apiKey ? new ResendEmailProvider(apiKey) : new ConsoleEmailProvider()`)
 * -- the interface and every call site already support it.
 */
export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;
  cachedProvider = new ConsoleEmailProvider();
  return cachedProvider;
}
