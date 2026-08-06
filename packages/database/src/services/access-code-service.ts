import { rawDb } from "../client";

// FreeTierAccessCode is not organization-scoped (it exists before any org does),
// so these queries intentionally use rawDb rather than the tenant-guarded client --
// same reasoning as PasswordResetToken's functions in user-service.ts.

const CODE_BYTES = 9;

/**
 * Uses the Web Crypto API (a global in Node 19+, also available in Next.js's Edge
 * runtime) rather than node:crypto -- this file is reachable from middleware.ts's
 * Edge-bundled auth.ts via @ruach/database's barrel export, and node:crypto imports
 * fail that bundle (same constraint documented in prayer-service.ts/user-service.ts).
 */
function generateCode(): string {
  const bytes = new Uint8Array(CODE_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createAccessCode(params: { createdByUserId: string; note?: string; expiresAt?: Date }) {
  return rawDb.freeTierAccessCode.create({
    data: {
      code: generateCode(),
      createdByUserId: params.createdByUserId,
      note: params.note,
      expiresAt: params.expiresAt,
    },
  });
}

export async function getValidAccessCode(code: string) {
  const record = await rawDb.freeTierAccessCode.findUnique({ where: { code } });
  if (!record || record.usedAt) return null;
  if (record.expiresAt && record.expiresAt <= new Date()) return null;
  return record;
}

export async function listAccessCodes() {
  return rawDb.freeTierAccessCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { usedBy: { select: { email: true } } },
  });
}
