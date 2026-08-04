import Link from "next/link";
import { buttonClasses } from "./ui/Button";
import { brandButtonStyle, brandTintStyle } from "../lib/prayer-branding";

interface PrayerWallHeaderProps {
  organizationName: string;
  publicPrayerWallId: string;
  logoUrl: string | null;
  brandColor: string;
  isLoggedIn: boolean;
  onLogout?: () => Promise<void>;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PrayerWallHeader({
  organizationName,
  publicPrayerWallId,
  logoUrl,
  brandColor,
  isLoggedIn,
  onLogout,
}: PrayerWallHeaderProps) {
  const base = `/prayer/${publicPrayerWallId}`;

  return (
    <header className="border-b border-border" style={brandTintStyle(brandColor, 0.07)}>
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-3.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={organizationName} className="shadow-panel h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              className="shadow-panel flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: brandColor }}
            >
              {initials(organizationName)}
            </span>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColor }}>
              Prayer Wall
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-ink">{organizationName}</h1>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm" style={{ "--brand-color": brandColor } as React.CSSProperties}>
          <Link
            href={base}
            className="rounded-sm text-ink-secondary hover:text-[color:var(--brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40 focus-visible:ring-offset-2"
          >
            Wall
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href={`${base}/submit`}
                className="rounded-sm text-ink-secondary hover:text-[color:var(--brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40 focus-visible:ring-offset-2"
              >
                Submit a request
              </Link>
              <Link
                href={`${base}/mine`}
                className="rounded-sm text-ink-secondary hover:text-[color:var(--brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40 focus-visible:ring-offset-2"
              >
                My requests
              </Link>
              {onLogout && (
                <form action={onLogout}>
                  <button
                    type="submit"
                    className="rounded-sm text-ink-secondary hover:text-[color:var(--brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40 focus-visible:ring-offset-2"
                  >
                    Log out
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <Link
                href={`${base}/login`}
                className="rounded-sm text-ink-secondary hover:text-[color:var(--brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40 focus-visible:ring-offset-2"
              >
                Log in
              </Link>
              <Link href={`${base}/signup`} style={brandButtonStyle(brandColor)} className={buttonClasses("primary", "sm")}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
