import { tenantDb } from "../client";

export async function createActionLink(params: {
  organizationId: string;
  label: string;
  type: string;
  url: string;
  icon?: string;
}) {
  return tenantDb.actionLink.create({ data: params });
}

export async function listActiveActionLinks(organizationId: string) {
  return tenantDb.actionLink.findMany({ where: { organizationId, isActive: true } });
}
