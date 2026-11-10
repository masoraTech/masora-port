/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === "development" ? ".next-dev" : ".next"),
  experimental: { serverActions: { bodySizeLimit: "30mb" } },
};
export default nextConfig;
