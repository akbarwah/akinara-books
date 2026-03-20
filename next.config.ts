import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ FIX: Optimasi gambar
  images: {
    // Format modern yang lebih ringan
    formats: ["image/avif", "image/webp"],
    // Remote patterns untuk Supabase storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ✅ FIX: Kompres semua response
  compress: true,

  // ✅ FIX: Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cegah MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Cegah clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Kontrol referrer info
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Cegah XSS
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;