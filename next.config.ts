import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb"],
};

export default nextConfig;
