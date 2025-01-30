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
        source: "/(.*)",  // Apply this to all routes
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' ws: wss:; frame-src 'self'; style-src 'self' 'unsafe-inline';",
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
