import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SaveFileInput, SaveFileResult, StorageProvider } from "./StorageProvider";

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/gif": ".gif",
};

/**
 * No real object storage is wired up yet (same product-stage decision as
 * ConsoleEmailProvider: ship the feature end-to-end against a local stub, swap the
 * provider later without touching callers). Saves under `${publicDir}/uploads/` so
 * Next.js serves the result as a static asset -- `publicDir` is the dashboard app's
 * own `public/` directory, passed in by the caller so this package stays app-agnostic.
 */
export class LocalStorageProvider implements StorageProvider {
  constructor(
    private readonly publicDir: string,
    private readonly publicUrlPrefix = "/uploads",
  ) {}

  async saveFile(input: SaveFileInput): Promise<SaveFileResult> {
    const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType] ?? path.extname(input.fileName) ?? "";
    const fileName = `${randomUUID()}${extension}`;
    const orgDir = path.join(this.publicDir, "uploads", input.organizationId);

    await mkdir(orgDir, { recursive: true });
    await writeFile(path.join(orgDir, fileName), input.data);

    return { url: `${this.publicUrlPrefix}/${input.organizationId}/${fileName}` };
  }
}
