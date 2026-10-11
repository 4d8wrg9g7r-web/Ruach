import { resourceService } from "@ruach/database";
import type { AIProvider } from "./AIProvider";

const DESCRIPTION_CHARS = 1500;
const EXCERPT_CHARS = 2000;
const MAX_KNOWN_SPEAKERS = 50;
const MAX_NAME_LENGTH = 60;

const HONORIFICS = /^(?:(?:guest\s+speaker|senior\s+pastor|lead\s+pastor|youth\s+pastor|associate\s+pastor|pastors?|pr\.?|rev(?:erend|\.)?|dr\.?|bishop|apostle|elder|minister|evangelist|prophet(?:ess)?|mr\.?|mrs\.?|ms\.?)\s+)+/i;

/** Answers that name nobody, which the model occasionally returns instead of null. */
const NOT_A_PERSON = new Set(["unknown", "none", "n/a", "null", "various", "multiple speakers", "guest speaker", "pastor"]);

/**
 * Cleans a model-returned speaker into the one spelling the library should show:
 * drops titles ("Pastor Mitch Horton" -> "Mitch Horton"), rejects non-names, and
 * maps to an existing speaker's spelling when it's the same person -- by full name,
 * or by a first name only one known speaker has ("Mitch" -> "Mitch Horton"). One
 * person under two spellings would show twice in the Speaker dropdown.
 */
export function normalizeSpeakerName(raw: unknown, knownSpeakers: string[]): string | null {
  if (typeof raw !== "string") return null;
  const name = raw
    .replace(/\s+/g, " ")
    .trim()
    .replace(HONORIFICS, "")
    .replace(/^[\s"'“”‘’,.:;-]+|[\s"'“”‘’,:;-]+$/g, "");
  if (!name || name.length > MAX_NAME_LENGTH || !/\p{L}/u.test(name) || /\d/.test(name)) return null;
  const key = name.toLowerCase();
  if (NOT_A_PERSON.has(key)) return null;

  const exact = knownSpeakers.find((known) => known.toLowerCase() === key);
  if (exact) return exact;
  if (!name.includes(" ")) {
    const byFirstName = knownSpeakers.filter((known) => known.toLowerCase().split(" ")[0] === key);
    if (byFirstName.length === 1) return byFirstName[0]!;
  }
  return name;
}

/** Adds the speaker to an already-built search document (see CategorizationService) so chat can match on it. */
function withSpeakerLine(searchDocument: string | null, speakerName: string): string | undefined {
  if (!searchDocument || /^SPEAKER: /m.test(searchDocument)) return undefined;
  const lines = searchDocument.split("\n");
  lines.splice(1, 0, `SPEAKER: ${speakerName}`);
  return lines.join("\n");
}

/**
 * Fills Resource.speakerName for resources whose provider didn't supply one -- YouTube
 * and RSS imports never do, so without this the sermon library's Speaker filter stays
 * hidden. Runs for each newly categorized resource (CategorizationService) and, for
 * everything imported before this existed, from the speakers cron. Only ever fills an
 * empty speaker; staff can correct or clear one on the resource page.
 */
export class SpeakerService {
  constructor(private readonly aiProvider: AIProvider) {}

  /** Returns the speaker written, or null when none was found (the resource is still marked as checked). */
  async detect(organizationId: string, resourceId: string, knownSpeakers?: string[]): Promise<string | null> {
    const resource = await resourceService.getResource(organizationId, resourceId);
    if (!resource || resource.speakerName) return null;
    const known = (knownSpeakers ?? (await resourceService.listSpeakerNames(organizationId))).slice(0, MAX_KNOWN_SPEAKERS);

    const output = await this.aiProvider.detectSpeaker({
      title: resource.title,
      description: resource.description?.slice(0, DESCRIPTION_CHARS) || null,
      excerpt: resource.cleanTranscript?.slice(0, EXCERPT_CHARS) || null,
      knownSpeakers: known,
    });
    const speakerName = normalizeSpeakerName(output?.speakerName, known);

    const written = await resourceService.setDetectedSpeaker(
      organizationId,
      resourceId,
      speakerName,
      speakerName ? withSpeakerLine(resource.searchDocument, speakerName) : undefined,
    );
    if (!written || !speakerName) return null;
    await resourceService.addEvidence({
      organizationId,
      resourceId,
      fieldName: "speakerName",
      generatedValue: speakerName,
      sourceExcerpt: resource.title,
      confidenceScore: 0.8,
    });
    return speakerName;
  }

  /**
   * Works through resources nobody has checked yet, newest first, until `limit` are
   * done or `deadline` passes. Calls run a few at a time; one failure is logged and
   * left unchecked so the next run retries it. Returns the orgs whose library changed
   * so the caller can invalidate their cached catalogs.
   */
  async backfill(options: { limit: number; deadline: number; concurrency?: number }) {
    const queue = await resourceService.listResourcesNeedingSpeaker(options.limit);
    const knownByOrg = new Map<string, string[]>();
    const changedOrgs = new Set<string>();
    let checked = 0;
    let found = 0;
    let failed = 0;

    const worker = async () => {
      for (let next = queue.shift(); next && Date.now() < options.deadline; next = queue.shift()) {
        try {
          let known = knownByOrg.get(next.organizationId);
          if (!known) {
            known = await resourceService.listSpeakerNames(next.organizationId);
            knownByOrg.set(next.organizationId, known);
          }
          const speaker = await this.detect(next.organizationId, next.id, known);
          checked += 1;
          if (speaker) {
            found += 1;
            changedOrgs.add(next.organizationId);
            // Later items in this run reuse the new spelling too.
            if (!known.includes(speaker)) known.push(speaker);
          }
        } catch (err) {
          failed += 1;
          console.error(`Speaker detection failed for resource ${next.id}:`, err);
        }
      }
    };
    await Promise.all(Array.from({ length: options.concurrency ?? 5 }, worker));

    return { checked, found, failed, leftInBatch: queue.length, changedOrgs: [...changedOrgs] };
  }
}
