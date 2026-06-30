/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BFF_HTTP_URL: process.env.NEXT_PUBLIC_BFF_HTTP_URL ?? "http://localhost:4000",
    NEXT_PUBLIC_BFF_WS_URL: process.env.NEXT_PUBLIC_BFF_WS_URL ?? "ws://localhost:4000/ws",
  },
};

export default nextConfig;
