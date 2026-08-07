import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { JournalCard } from "@/components/JournalCard";
import { JOURNAL } from "@/content/journal";

export function JournalPreview() {
  const posts = JOURNAL.slice(0, 3);
  return (
    <section className="bg-surface px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-editorial">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-champagne">The Journal</p>
            <h2 className="mt-6 max-w-xl text-balance font-serif text-display-md text-ink">
              Stories, guides, and the occasional planning secret.
            </h2>
          </div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-ink transition-colors hover:border-ink"
          >
            Read the journal &rarr;
          </Link>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08}>
              <JournalCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
