import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "node:path";

const workspaceRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  async redirects() {
    return [
      {
        source: "/profile",
        destination: "/settings",
        permanent: true,
      },
      {
        source: "/profile/:path*",
        destination: "/settings/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {
    root: workspaceRoot,
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwist(nextConfig);
