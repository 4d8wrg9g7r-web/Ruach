import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { noIndexMetadata } from "../../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;
import { accessCodeService } from "@ruach/database";
import { CopySnippetButton } from "../../../components/CopySnippetButton";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input, Select } from "../../../components/ui/Input";
import { requirePlatformAdmin } from "../../../lib/session";

async function createAccessCodeAction(formData: FormData) {
  "use server";
  const user = await requirePlatformAdmin();
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const expiresInDays = String(formData.get("expiresInDays") ?? "").trim();
  const expiresAt = expiresInDays ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000) : undefined;

  await accessCodeService.createAccessCode({ createdByUserId: user.id, note, expiresAt });
  revalidatePath("/admin/access-codes");
}

function codeStatus(code: { usedAt: Date | null; expiresAt: Date | null }): "used" | "expired" | "active" {
  if (code.usedAt) return "used";
  if (code.expiresAt && code.expiresAt <= new Date()) return "expired";
  return "active";
}

export default async function AccessCodesPage() {
  await requirePlatformAdmin();
  const codes = await accessCodeService.listAccessCodes();
  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Access codes</h1>
      <p className="mb-8 text-sm text-ink-secondary">
        Generate a one-time code that waives payment for a single signup, creating a free-tier org. Send the tester
        the resulting link -- once they use it, they get a normal, fully separate dashboard like any paid subscriber.
      </p>

      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Generate a code</h2>
        <form action={createAccessCodeAction} className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-ink-secondary">
            Note <span className="text-ink-muted">(who is this for?)</span>
            <Input name="note" placeholder="Jane at First Baptist" className="mt-1 block w-56" />
          </label>
          <label className="text-sm text-ink-secondary">
            Expires in
            <Select name="expiresInDays" defaultValue="" className="mt-1 block">
              <option value="">Never</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </Select>
          </label>
          <button type="submit" className={buttonClasses("primary", "md")}>
            Generate code
          </button>
        </form>
      </Card>

      <Card padding="none">
        {codes.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-muted">No access codes yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {codes.map((code) => {
              const link = `${appOrigin}/signup?code=${code.code}`;
              const status = codeStatus(code);
              return (
                <div key={code.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{code.note || "(no note)"}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {status === "used" ? `Used by ${code.usedBy?.email ?? "unknown"}` : status === "expired" ? "Expired" : link}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={status === "used" ? "neutral" : status === "expired" ? "danger" : "success"}>{status}</Badge>
                    {status === "active" && <CopySnippetButton text={link} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
