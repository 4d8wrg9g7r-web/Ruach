import { tenantDb } from "../client";

export async function createCollection(params: {
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
}) {
  return tenantDb.collection.create({ data: params });
}

export async function listCollections(organizationId: string) {
  return tenantDb.collection.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
}

export async function addResourceToCollection(organizationId: string, resourceId: string, collectionId: string) {
  return tenantDb.resourceCollection.create({
    data: { organizationId, resourceId, collectionId },
  });
}
