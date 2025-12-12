/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "./"
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
