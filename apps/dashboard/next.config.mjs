/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ruach/ai", "@ruach/database", "@ruach/providers", "@ruach/retrieval", "@ruach/shared-types"],
};

export default nextConfig;
