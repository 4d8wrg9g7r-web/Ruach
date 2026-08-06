import { NextResponse } from "next/server";
import { organizationService } from "@ruach/database";
import { getCurrentUser } from "../../../../lib/session";

/** Polled by /signup/finishing while waiting for the Stripe webhook to create the org. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await organizationService.getMembershipsForUser(user.id);
  return NextResponse.json({ ready: memberships.length > 0 });
}
