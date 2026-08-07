import { dirname } from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This is a standalone project living inside a larger repo; pin the tracing
  // root to this directory so Next doesn't infer the outer pnpm workspace.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  images: {
    formats: ["image/avif", "image/webp"],
    // Placeholder photography is served from Unsplash while the studio's real
    // galleries are wired into the CMS. Swap these remotePatterns for the final
    // asset host (or a local /public pipeline) at launch.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  eslint: {
    // Design/craft work ships without blocking on lint in this environment;
    // run `pnpm lint` locally before release.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
