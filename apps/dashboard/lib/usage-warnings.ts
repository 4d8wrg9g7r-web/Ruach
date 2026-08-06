import type { Organization } from "@ruach/database";
import { billingService, organizationService, teamService } from "@ruach/database";
import { getEmailProvider } from "@ruach/email";

export interface UsageWarningOutcome {
  organizationId: string;
  threshold: "75" | "90" | null;
  sent: boolean;
}

/**
 * Purely informational -- links back to /billing to upgrade, never blocks anything
 * (matches the standing "no hard usage-limit enforcement" decision). Each threshold
 * fires at most once per billing period: usageWarning75SentAt/90SentAt are compared
 * against the current period's start rather than explicitly reset each month, so a
 * stale timestamp from a prior period is treated as "eligible again."
 */
async function checkOrganizationUsage(organization: Organization): Promise<UsageWarningOutcome> {
  const usage = await billingService.getCurrentUsage(organization.id, organization.planKey);
  const ratio = billingService.usageRatio(usage);

  const alreadySent = (sentAt: Date | null) => sentAt !== null && sentAt >= usage.periodStart;

  const threshold: "75" | "90" | null =
    ratio >= 0.9 && !alreadySent(organization.usageWarning90SentAt)
      ? "90"
      : ratio >= 0.75 && !alreadySent(organization.usageWarning75SentAt)
        ? "75"
        : null;

  if (!threshold) return { organizationId: organization.id, threshold: null, sent: false };

  const members = await teamService.listMembers(organization.id);
  const owner = members.find((m) => m.role === "OWNER");
  if (!owner) return { organizationId: organization.id, threshold, sent: false };

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  await getEmailProvider().sendEmail({
    to: owner.user.email,
    subject: `${organization.name} has used ${threshold}% of this month's AI questions`,
    text: `${organization.name} has used ${usage.queriesUsed.toLocaleString()} of ${usage.plan.monthlyQueryLimit?.toLocaleString()} widget questions available this month on the ${usage.plan.name} plan.\n\nThis doesn't interrupt your widget -- it keeps working as normal. If you'd like more headroom, you can upgrade any time: ${appOrigin}/billing`,
  });
  await organizationService.recordUsageWarningSent(organization.id, threshold);

  return { organizationId: organization.id, threshold, sent: true };
}

/** Entry point for the scheduled usage-warning run (see app/api/cron/usage-warnings/route.ts). One shared job checks every organization, mirroring lib/content-sync.ts's shape. */
export async function checkAllOrganizationsUsage(): Promise<UsageWarningOutcome[]> {
  const organizations = await organizationService.listAllOrganizations();
  const outcomes: UsageWarningOutcome[] = [];
  for (const organization of organizations) {
    outcomes.push(await checkOrganizationUsage(organization));
  }
  return outcomes;
}
