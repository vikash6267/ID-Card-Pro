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
            value: "camera=(self), microphone=(self), geolocation=(self)"
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: blob: https://www.gstatic.com;
              connect-src 'self' https://api.cardpro.co.in/;
              frame-src 'self';
              font-src 'self' https://fonts.gstatic.com;
              object-src 'none';
              media-src 'self' blob: https://www.gstatic.com;
              worker-src 'self' blob:;
            `.replace(/\n/g, ' ').trim() // Removing unnecessary line breaks
          },
        ],
      },
    ];
  }
,  
  experimental: {
    appDir: true,
    serverActions: true,
  },
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
