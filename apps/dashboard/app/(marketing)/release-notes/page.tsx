import type { Metadata } from "next";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { pageMetadata } from "../../../lib/marketing/page-metadata";
import { RELEASE_NOTES, type ReleaseNote } from "../../../lib/marketing/release-notes";

export const metadata: Metadata = pageMetadata({
  title: "Release Notes",
  description: "What's new in Ruach -- every update to the conversational assistant and Prayer Wall, in one place.",
  path: "/release-notes",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

interface MonthGroup {
  key: string;
  label: string;
  notes: ReleaseNote[];
}

/**
 * Sorts newest-first and groups by calendar month regardless of the source array's
 * own order -- release-notes.ts documents "add to the top" as the human convention
 * for readability, but a future entry added out of order (or two authors racing on
 * separate branches) shouldn't be able to silently break the page's own
 * reverse-chronological guarantee.
 */
function groupByMonth(notes: ReleaseNote[]): MonthGroup[] {
  const sorted = [...notes].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const groups: MonthGroup[] = [];
  for (const note of sorted) {
    const key = note.date.slice(0, 7); // "YYYY-MM"
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: MONTH_FORMATTER.format(new Date(`${key}-01T00:00:00Z`)), notes: [] };
      groups.push(group);
    }
    group.notes.push(note);
  }
  return groups;
}

export default function ReleaseNotesPage() {
  const months = groupByMonth(RELEASE_NOTES);

  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>Release Notes</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">What&rsquo;s new in Ruach.</h1>
          <p className="mt-4 text-lg text-ink-secondary">Every update to the conversational assistant and Prayer Wall, in one place.</p>
        </FadeIn>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-14 px-5">
          {months.map((month, i) => (
            <FadeIn key={month.key} delay={Math.min(i * 0.05, 0.2)}>
              <section aria-labelledby={`month-${month.key}`}>
                <h2 id={`month-${month.key}`} className="mb-6 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {month.label}
                </h2>
                <ol className="flex flex-col gap-8">
                  {month.notes.map((note) => (
                    <li key={`${note.date}-${note.headline}`}>
                      <article className="border-l-2 border-accent/30 pl-5">
                        <time dateTime={note.date} className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                          {DATE_FORMATTER.format(new Date(`${note.date}T00:00:00Z`))}
                        </time>
                        <h3 className="mt-1 text-lg font-semibold text-ink">{note.headline}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{note.detail}</p>
                      </article>
                    </li>
                  ))}
                </ol>
              </section>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
