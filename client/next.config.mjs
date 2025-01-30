/** @type {import('next').NextConfig} */
const nextConfig = {
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
      experimental: {
        optimizeCss: true,
      },
};

export default nextConfig;
