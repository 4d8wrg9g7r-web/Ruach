import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app is self-contained and lives beside (not inside) the pnpm workspace;
  // pin the tracing root so Next doesn't climb to the monorepo lockfile.
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Preserve search authority from the current site (§36): map legacy URLs onto
  // the new information architecture. Extend as the full URL inventory is audited.
  async redirects() {
    return [
      { source: "/guitars", destination: "/models", permanent: true },
      { source: "/the-arium", destination: "/arium", permanent: true },
      { source: "/order", destination: "/build", permanent: true },
      { source: "/custom", destination: "/build", permanent: true },
      { source: "/instock", destination: "/in-stock", permanent: true },
      { source: "/about", destination: "/story", permanent: true },
    ];
  },
};

export default nextConfig;
