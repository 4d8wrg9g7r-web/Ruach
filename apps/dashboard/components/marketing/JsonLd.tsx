/**
 * Renders one or more schema.org objects (see lib/marketing/schema.ts's builders) as
 * <script type="application/ld+json"> tags. Accepts a single object or an array so a
 * page with one schema (FAQPage) and a page with several (Organization +
 * SoftwareApplication) use the same component.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        // eslint-disable-next-line react/no-danger -- JSON.stringify of our own schema.ts builders, never user input
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
    </>
  );
}
