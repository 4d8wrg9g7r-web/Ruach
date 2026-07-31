# Subsplash integration

**Status: scaffold only, indefinitely.** Subsplash has no public documented API, and
the brief explicitly forbids inventing undocumented endpoints (brief §16).
`getResourceProvider("SUBSPLASH")` (`packages/providers/src/registry.ts`) currently
throws, pointing callers at manual import instead.

If Subsplash API access is obtained through a partnership or documented agreement,
implement `SubsplashProvider` against the same `ResourceProvider` interface as the
other providers, with endpoint mappings kept configurable and documented rather than
hardcoded, per the brief's requirement. Until then, subscribers with Subsplash content
use the generic-URL or manual-entry workflows (`docs/generic-url-import.md`).
