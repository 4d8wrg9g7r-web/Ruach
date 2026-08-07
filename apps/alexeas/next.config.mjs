/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Fully static export — the whole site prerenders to `out/`, so it can be
  // dropped on any static host (Cloudflare Pages, etc.) with no server runtime.
  // Shareable builds are carried in the URL query (?c=CODE) and decoded on the
  // client, so no dynamic server route is needed.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
