import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

/** Accessible breadcrumb trail + BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-editorial px-5 pt-10 sm:px-8">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-2 font-sans text-[0.66rem] uppercase tracking-label text-mist">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? (
                <span className="text-charcoal" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-colors hover:text-charcoal">
                  {item.name}
                </Link>
              )}
              {!last && <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
