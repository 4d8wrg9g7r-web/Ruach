/**
 * Single source of truth for factual business information. Everything here is
 * grounded in the real Alexeas Guitars & Mandolins workshop:
 *   - Maker: James Alexeas (surname of Greek origin)
 *   - Location: Clayton, North Carolina, USA
 *   - Contact: jalexeas@gmail.com
 *   - Work: small-production, individually built acoustic guitars & mandolins;
 *     setups, repairs, and restoration of stringed instruments.
 *
 * Heritage is referenced honestly (Greek roots, a workshop in the American
 * South) and never invented. The Mediterranean warmth of the design is an
 * aesthetic language, not a claim that the shop is located in Greece.
 */

export const SITE = {
  name: "Alexeas Guitars & Mandolins",
  shortName: "Alexeas",
  maker: "James Alexeas",
  url: "https://alexeasguitars.com",
  email: "jalexeas@gmail.com",
  location: {
    city: "Clayton",
    region: "North Carolina",
    regionCode: "NC",
    country: "United States",
    // Public address listed for the workshop.
    street: "101 Bradford Circle",
    postalCode: "27527",
  },
  tagline: "Instruments made slowly. Made deliberately. Made to remain.",
  social: {
    instagram: "https://www.instagram.com/alexeasguitars/",
    facebook: "https://www.facebook.com/alexeasguitars/",
  },
  get organizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": ["Organization", "LocalBusiness"],
      name: this.name,
      description:
        "Handcrafted acoustic guitars, mandolins, and stringed instruments built individually by luthier James Alexeas.",
      email: this.email,
      url: this.url,
      founder: { "@type": "Person", name: this.maker },
      address: {
        "@type": "PostalAddress",
        streetAddress: this.location.street,
        addressLocality: this.location.city,
        addressRegion: this.location.regionCode,
        postalCode: this.location.postalCode,
        addressCountry: "US",
      },
      sameAs: [this.social.instagram, this.social.facebook],
      knowsAbout: [
        "Lutherie",
        "Acoustic guitar building",
        "Mandolin building",
        "Instrument repair and restoration",
      ],
    };
  },
} as const;

export type NavItem = { label: string; href: string };

export const NAV: NavItem[] = [
  { label: "Instruments", href: "/instruments" },
  { label: "Build Yours", href: "/build" },
  { label: "The Craft", href: "/craft" },
  { label: "Workshop", href: "/workshop" },
  { label: "Repairs", href: "/repairs" },
  { label: "Contact", href: "/contact" },
];
