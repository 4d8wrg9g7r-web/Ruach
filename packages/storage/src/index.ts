export type { SaveFileInput, SaveFileResult, StorageProvider } from "./StorageProvider";
export { LocalStorageProvider } from "./LocalStorageProvider";

import type { StorageProvider } from "./StorageProvider";
import { LocalStorageProvider } from "./LocalStorageProvider";

let cachedProvider: StorageProvider | null = null;

/**
 * Unlike getAIProvider()/getResourceProvider(), this does not branch on an env var --
 * there is no real provider to switch to yet (product decision: ship the feature
 * against a local-disk stub now). When a real provider is chosen, swap the returned
 * instance here -- the interface and every call site already support it.
 */
export function getStorageProvider(publicDir: string): StorageProvider {
  if (cachedProvider) return cachedProvider;
  cachedProvider = new LocalStorageProvider(publicDir);
  return cachedProvider;
}
