import { tenantDb } from "../client";

const MAX_LINKS_PER_ORGANIZATION = 10;

export async function createActionLink(params: {
  organizationId: string;
  label: string;
  type: string;
  url: string;
  icon?: string;
}) {
  const count = await tenantDb.actionLink.count({ where: { organizationId: params.organizationId } });
  if (count >= MAX_LINKS_PER_ORGANIZATION) {
    throw new Error(`Maximum of ${MAX_LINKS_PER_ORGANIZATION} links reached.`);
  }
  return tenantDb.actionLink.create({ data: { ...params, order: count } });
}

/** Widget-facing: only links the admin has toggled on, in display order. */
export async function listActiveActionLinks(organizationId: string) {
  return tenantDb.actionLink.findMany({
    where: { organizationId, isActive: true },
    orderBy: { order: "asc" },
  });
}

/** Dashboard-facing: every link (including disabled ones, so staff can re-enable them). */
export async function listActionLinks(organizationId: string) {
  return tenantDb.actionLink.findMany({
    where: { organizationId },
    orderBy: { order: "asc" },
  });
}

export async function updateActionLink(
  organizationId: string,
  linkId: string,
  updates: Partial<{ label: string; url: string; isActive: boolean }>,
) {
  const result = await tenantDb.actionLink.updateMany({
    where: { id: linkId, organizationId },
    data: updates,
  });
  if (result.count === 0) return null;
  return tenantDb.actionLink.findFirst({ where: { id: linkId, organizationId } });
}

export async function deleteActionLink(organizationId: string, linkId: string) {
  return tenantDb.actionLink.deleteMany({ where: { id: linkId, organizationId } });
}

/**
 * Swaps a link's order with its immediate up/down neighbor. Renumbers every one of
 * the org's links to 0..n-1 first (by current order, then createdAt as a tiebreaker)
 * so stale/duplicate order values -- e.g. rows that predate this column, which all
 * default to 0 -- can't produce a no-op swap.
 */
export async function reorderActionLink(organizationId: string, linkId: string, direction: "up" | "down") {
  return tenantDb.$transaction(async (tx) => {
    const links = await tx.actionLink.findMany({
      where: { organizationId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    // updateMany (not update) throughout -- the tenant guard requires organizationId
    // in every scoped write's `where`, and Prisma's `update()` where-unique type only
    // accepts actual unique fields (id), not id+organizationId together.
    for (let i = 0; i < links.length; i += 1) {
      if (links[i]!.order !== i) {
        await tx.actionLink.updateMany({ where: { id: links[i]!.id, organizationId }, data: { order: i } });
        links[i]!.order = i;
      }
    }

    const index = links.findIndex((link) => link.id === linkId);
    if (index === -1) return null;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= links.length) return links;

    await tx.actionLink.updateMany({ where: { id: links[index]!.id, organizationId }, data: { order: swapWith } });
    await tx.actionLink.updateMany({ where: { id: links[swapWith]!.id, organizationId }, data: { order: index } });

    return links;
  });
}
