import Link from "next/link";
import { StudioImage } from "./StudioImage";
import type { JournalPost } from "@/content/journal";

export function JournalCard({ post, sizes = "(max-width: 768px) 100vw, 33vw" }: { post: JournalPost; sizes?: string }) {
  return (
    <article className="group">
      <Link href={`/journal/${post.slug}`} data-cursor="view" className="block">
        <div className="crop-frame relative aspect-[4/5] overflow-hidden">
          <StudioImage
            image={post.image}
            sizes={sizes}
            className="transition-transform duration-[1400ms] ease-aperture group-hover:scale-[1.05]"
          />
        </div>
        <div className="mt-5 flex items-center gap-3 font-sans text-[0.62rem] uppercase tracking-label text-mist">
          <span className="text-champagne">{post.category}</span>
          <span aria-hidden>&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-charcoal">
          {post.title}
        </h3>
        <p className="mt-3 max-w-sm text-[0.92rem] leading-relaxed text-charcoal/70">{post.excerpt}</p>
      </Link>
    </article>
  );
}
