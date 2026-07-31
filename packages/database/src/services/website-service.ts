import { tenantDb } from "../client";

export async function createWebsite(params: {
  organizationId: string;
  name: string;
  primaryDomain: string;
  allowedDomains?: string[];
}) {
  return tenantDb.website.create({
    data: {
      organizationId: params.organizationId,
      name: params.name,
      primaryDomain: params.primaryDomain,
      allowedDomains: params.allowedDomains ?? [params.primaryDomain],
    },
  });
}

export async function listWebsites(organizationId: string) {
  return tenantDb.website.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getWebsite(organizationId: string, websiteId: string) {
  return tenantDb.website.findFirst({ where: { id: websiteId, organizationId } });
}

export function isDomainAllowed(
  website: { primaryDomain: string; allowedDomains: string[]; stagingDomains: string[] },
  hostname: string,
): boolean {
  const normalize = (d: string) => d.toLowerCase().replace(/^www\./, "");
  const target = normalize(hostname);
  const candidates = [website.primaryDomain, ...website.allowedDomains, ...website.stagingDomains].map(normalize);
  return candidates.includes(target);
}
