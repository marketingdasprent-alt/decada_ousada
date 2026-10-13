import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The Next.js agent note lives in AGENTS.md, rewritten in house style (see DECISIONS.md)
  agentRules: false,
  images: {
    // Fotos das viaturas servidas pelo storage do WeGest (links temporários de 24 h)
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      // Publicações do Instagram (CDN da Meta, links temporários)
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Build num só processo: cada processo tem a sua cache do catálogo e pede o detalhe de
    // cada modelo ao WeGest; com 11 em paralelo passava o limite de 120 pedidos/min (DECISIONS.md 2026-10-13)
    cpus: 1,
  },
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
