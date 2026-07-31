import { rawDb } from "../client";

// User is not organization-owned (a user can belong to multiple organizations),
// so these queries intentionally use rawDb rather than the tenant-guarded client.

export async function findUserByEmail(email: string) {
  return rawDb.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function createUser(params: { email: string; name?: string; passwordHash: string }) {
  return rawDb.user.create({
    data: { email: params.email.toLowerCase(), name: params.name, passwordHash: params.passwordHash },
  });
}

export async function getUser(userId: string) {
  return rawDb.user.findUnique({ where: { id: userId } });
}
