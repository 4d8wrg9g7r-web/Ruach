"use client";

import { Input } from "./ui/Input";
import { SubmitButton } from "./SubmitButton";
import { useToast } from "./ui/Toast";

interface PublicContactFormProps {
  defaultContactEmail: string;
  defaultPublicWebsiteUrl: string;
  action: (formData: FormData) => Promise<void>;
}

export function PublicContactForm({ defaultContactEmail, defaultPublicWebsiteUrl, action }: PublicContactFormProps) {
  const { showToast } = useToast();

  async function handleSave(formData: FormData) {
    try {
      await action(formData);
      showToast("Contact info saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong. Please try again.", "error");
    }
  }

  return (
    <form action={handleSave} className="flex flex-col gap-4">
      <label className="text-sm text-ink-secondary">
        Contact email <span className="font-normal text-ink-muted">(optional)</span>
        <Input
          name="contactEmail"
          type="email"
          placeholder="e.g. office@yourchurch.org"
          defaultValue={defaultContactEmail}
          className="mt-1 max-w-sm"
        />
      </label>
      <label className="text-sm text-ink-secondary">
        Website <span className="font-normal text-ink-muted">(optional)</span>
        <Input
          name="publicWebsiteUrl"
          type="url"
          placeholder="e.g. https://yourchurch.org"
          defaultValue={defaultPublicWebsiteUrl}
          className="mt-1 max-w-sm"
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
      </div>
    </form>
  );
}
