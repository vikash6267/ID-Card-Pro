/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cardpro.co.in",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://api.cardpro.co.in/; " +
              "img-src 'self' data: blob:; " +
              "connect-src 'self' https://api.cardpro.co.in/ ws: wss:; " +
              "frame-src 'self' https://www.google.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "media-src 'self' blob:; " // Allow media sources (camera, microphone)
          },
        ],
      },
    ];
  },
  experimental: {
    appDir: true,
    serverActions: true,
  },
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
