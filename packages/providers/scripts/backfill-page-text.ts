/**
 * One-off backfill: give already-imported pages the body text they never got.
 *
 * GenericUrlProvider only learned to extract a page's visible text (TranscriptSource
 * EXTRACTED_PAGE_TEXT) in migration 20260826185218. Because import-service only calls
 * getTranscript() when a resource is first created, every GENERIC_URL resource
 * imported before that has metadata alone -- typically a one-line og:description --
 * so the assistant cannot answer "when is Wednesday service?" from a page that plainly
 * says so. Re-importing the URL does not help: dedup returns the existing row before
 * extraction is reached.
 *
 * Usage (from the repo root):
 *   pnpm backfill:page-text            # report only, fetches nothing
 *   pnpm backfill:page-text --apply    # actually fetch and store
 *   pnpm backfill:page-text --apply --org <organizationId>
 *
 * Dry run is the default on purpose: this makes one outbound HTTP request per
 * resource, to churches' own sites.
 */
import { organizationService, resourceService } from "@ruach/database";
import { refreshResourceTranscript } from "../src/import-service";

/** Gap between fetches, so a site with many indexed pages isn't hit in a burst. */
const DELAY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const orgFlag = args.indexOf("--org");
  const onlyOrg = orgFlag !== -1 ? args[orgFlag + 1] : null;

  const organizations = onlyOrg
    ? [await organizationService.getOrganization(onlyOrg)]
    : await organizationService.listAllOrganizations();

  const totals = {
    candidates: 0,
    updated: 0,
    noText: 0,
    unchanged: 0,
    failed: 0,
  };

  for (const organization of organizations) {
    if (!organization) continue;
    const resources = await resourceService.listResourcesMissingTranscript(
      organization.id,
    );
    if (resources.length === 0) continue;

    totals.candidates += resources.length;
    console.info(
      `\n${organization.name} (${organization.id}) -- ${resources.length}`,
    );

    for (const resource of resources) {
      if (!apply) {
        console.info(
          `  would fetch: ${resource.title} -- ${resource.publicUrl}`,
        );
        continue;
      }
      try {
        const result = await refreshResourceTranscript(
          organization.id,
          resource.id,
        );
        if (result.status === "updated") {
          totals.updated += 1;
          console.info(`  ok (${result.characters} chars): ${resource.title}`);
        } else if (result.status === "unchanged") {
          totals.unchanged += 1;
        } else {
          // "no-text" is the common, expected outcome for a JS-rendered page this
          // regex-only extractor cannot see into, or a page that is genuinely just
          // navigation -- not a failure worth alarming about.
          totals.noText += 1;
          console.info(`  ${result.status}: ${resource.title}`);
        }
      } catch (err) {
        totals.failed += 1;
        console.error(
          `  FAILED: ${resource.title} -- ${err instanceof Error ? err.message : err}`,
        );
      }
      await sleep(DELAY_MS);
    }
  }

  console.info(
    apply
      ? `\nDone. ${totals.updated} updated, ${totals.unchanged} unchanged, ${totals.noText} without usable text, ${totals.failed} failed.`
      : `\nDry run. ${totals.candidates} resource(s) would be fetched. Re-run with --apply.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
