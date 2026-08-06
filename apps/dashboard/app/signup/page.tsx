import type { Metadata } from "next";
import bcrypt from "bcryptjs";
import { noIndexMetadata } from "../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;
import { redirect } from "next/navigation";
import { accessCodeService, auditService, organizationService, userService } from "@ruach/database";
import { signIn } from "../../auth";
import { SubmitButton } from "../../components/SubmitButton";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { slugify } from "../../lib/slug";

async function signupAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("orgName") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!name || !orgName) redirect("/signup?error=missing_fields");
  if (password.length < 8) redirect("/signup?error=too_short");

  const existing = await userService.findUserByEmail(email);
  if (existing) redirect("/signup?error=email_taken");

  const accessCode = code ? await accessCodeService.getValidAccessCode(code) : null;
  if (code && !accessCode) redirect(`/signup?error=invalid_code&code=${encodeURIComponent(code)}`);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userService.createUser({ email, name, passwordHash });

  let slug = slugify(orgName);
  let suffix = 0;
  while (await organizationService.getOrganizationBySlug(slug)) {
    suffix += 1;
    slug = `${slugify(orgName)}-${suffix}`;
  }

  if (accessCode) {
    // Access code -> free tier, no Stripe involved: org exists immediately.
    const organization = await organizationService.createOrganizationFromAccessCode({
      name: orgName,
      slug,
      ownerUserId: user.id,
      accessCodeId: accessCode.id,
    });
    await auditService.recordAuditEvent({
      organizationId: organization.id,
      actorUserId: user.id,
      action: "organization.created",
      targetType: "Organization",
      targetId: organization.id,
      metadata: { plan: "free", viaAccessCode: true },
    });
    await signIn("credentials", { email, password, redirect: false });
    redirect("/dashboard");
  }

  // No code -> account exists, org doesn't yet: sign in and send them to pick a
  // paid plan. The org itself is created by the Stripe webhook once they pay
  // (see api/stripe/webhook/route.ts), not here.
  await signIn("credentials", { email, password, redirect: false });
  redirect(`/signup/plan?orgName=${encodeURIComponent(orgName)}`);
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Enter your name and an organization name.",
  too_short: "Password must be at least 8 characters.",
  email_taken: "An account with that email already exists -- sign in instead.",
  invalid_code: "That access code is invalid, expired, or already used.",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string; code?: string }> }) {
  const sp = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mb-6 text-sm text-ink-secondary">Set up your organization&rsquo;s workspace on Ruach.</p>
      {sp.error && (
        <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
        </p>
      )}
      <Card>
        <form action={signupAction} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-ink-secondary">
            Your name
            <Input name="name" required className="mt-1 block w-full" />
          </label>
          <label className="text-sm font-medium text-ink-secondary">
            Email
            <Input name="email" type="email" required className="mt-1 block w-full" />
          </label>
          <label className="text-sm font-medium text-ink-secondary">
            Password
            <Input name="password" type="password" required minLength={8} className="mt-1 block w-full" />
          </label>
          <label className="text-sm font-medium text-ink-secondary">
            Organization name
            <Input name="orgName" required placeholder="Riverside Fellowship" className="mt-1 block w-full" />
          </label>
          <label className="text-sm font-medium text-ink-secondary">
            Access code <span className="font-normal text-ink-muted">(optional -- skip if you don&rsquo;t have one)</span>
            <Input name="code" defaultValue={sp.code ?? ""} className="mt-1 block w-full" />
          </label>
          <SubmitButton pendingLabel="Creating account...">Continue</SubmitButton>
        </form>
      </Card>
      <p className="mt-4 text-sm text-ink-secondary">
        Already have an account?{" "}
        <a href="/login" className="text-accent hover:underline">
          Sign in
        </a>
      </p>
    </main>
  );
}
