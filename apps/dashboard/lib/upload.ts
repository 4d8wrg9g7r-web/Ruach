import path from "node:path";
import { getStorageProvider } from "@ruach/storage";

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB -- logos are small UI assets, not hero images.

/**
 * Validates and persists a logo image uploaded through a server action's FormData.
 * Shared by the widget builder and prayer-wall settings forms so the size/type rules
 * (and the storage-provider wiring) live in exactly one place.
 */
export async function saveLogoUpload(organizationId: string, file: File): Promise<string> {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error("Logo must be a PNG, JPEG, WebP, GIF, or SVG image.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo must be smaller than 2MB.");
  }

  const data = Buffer.from(await file.arrayBuffer());
  const storage = getStorageProvider(path.join(process.cwd(), "public"));
  const { url } = await storage.saveFile({ organizationId, fileName: file.name, contentType: file.type, data });
  return url;
}
