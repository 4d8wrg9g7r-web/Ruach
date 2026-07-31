import { tenantDb } from "../client";

export async function recordAuditEvent(params: {
  organizationId: string;
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  return tenantDb.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata ?? undefined,
    },
  });
}

export async function listAuditEvents(organizationId: string, limit = 50) {
  return tenantDb.auditLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
