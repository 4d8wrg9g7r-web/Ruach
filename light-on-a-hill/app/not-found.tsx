import Link from "next/link";
import { ApertureIcon } from "@/components/ApertureIcon";

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[86vh] flex-col items-center justify-center bg-ink px-5 text-center text-paper">
      <div className="text-paper/40">
        <ApertureIcon progress={0.15} className="mx-auto h-20 w-20" />
      </div>
      <p className="eyebrow mt-10 text-champagne">Out of frame</p>
      <h1 className="mt-6 font-serif text-display-md">This page didn&rsquo;t develop.</h1>
      <p className="mt-5 max-w-sm text-[0.98rem] text-paper/75">
        The link may have moved. Let&rsquo;s get you back to the work.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
        <Link
          href="/"
          className="rounded-full bg-paper px-7 py-3.5 font-sans text-[0.72rem] uppercase tracking-label text-ink"
        >
          Back home
        </Link>
        <Link
          href="/inquire"
          className="border-b border-paper/40 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-paper/85 hover:border-paper"
        >
          Start an inquiry
        </Link>
      </div>
    </section>
  );
}
