/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: "images.pokemontcg.io",
      },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client"],
  experimental: {
    scrollRestoration: true,
  },
};

export default config;
