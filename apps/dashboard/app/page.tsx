import { redirect } from "next/navigation";
import { getCurrentOrganization, getCurrentUser } from "../lib/session";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organization = await getCurrentOrganization();
  if (!organization) redirect("/onboarding");

  redirect("/dashboard");
}
