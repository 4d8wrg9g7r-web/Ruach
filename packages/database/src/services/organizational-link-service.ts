import { tenantDb } from "../client";

const MAX_LINKS_PER_ORGANIZATION = 20;

export async function createOrganizationalLink(params: {
  organizationId: string;
  label: string;
  url: string;
  description?: string;
}) {
  const count = await tenantDb.organizationalLink.count({ where: { organizationId: params.organizationId } });
  if (count >= MAX_LINKS_PER_ORGANIZATION) {
    throw new Error(`Maximum of ${MAX_LINKS_PER_ORGANIZATION} organizational links reached.`);
  }
  return tenantDb.organizationalLink.create({ data: params });
}

/** Chat-matching-facing: only links staff has toggled on. */
export async function listActiveOrganizationalLinks(organizationId: string) {
  return tenantDb.organizationalLink.findMany({
    where: { organizationId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Dashboard-facing: every link (including disabled ones, so staff can re-enable them). */
export async function listOrganizationalLinks(organizationId: string) {
  return tenantDb.organizationalLink.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateOrganizationalLink(
  organizationId: string,
  linkId: string,
  updates: Partial<{ label: string; url: string; description: string | null; isActive: boolean }>,
) {
  const result = await tenantDb.organizationalLink.updateMany({
    where: { id: linkId, organizationId },
    data: updates,
  });
  if (result.count === 0) return null;
  return tenantDb.organizationalLink.findFirst({ where: { id: linkId, organizationId } });
}

export async function deleteOrganizationalLink(organizationId: string, linkId: string) {
  return tenantDb.organizationalLink.deleteMany({ where: { id: linkId, organizationId } });
}
