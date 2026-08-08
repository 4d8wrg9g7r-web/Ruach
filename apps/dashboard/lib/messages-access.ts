import { messagePermissions, type MessageAction } from "@ruach/database";
import { getCurrentOrgRole } from "./session";

/**
 * Server-side Communications authorization (BLUEPRINT §34), layered on the pure matrix
 * in @ruach/database. Delivery runs under the worker principal, not this path.
 */

export async function canMessages(organizationId: string, action: MessageAction): Promise<boolean> {
  const role = await getCurrentOrgRole(organizationId);
  return messagePermissions.can(role, action);
}

export async function requireMessages(organizationId: string, action: MessageAction): Promise<void> {
  if (!(await canMessages(organizationId, action))) {
    throw new Error("Not authorized to access Communications for this organization");
  }
}
