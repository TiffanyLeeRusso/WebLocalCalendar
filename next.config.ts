import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactCompiler: true,
    output: 'export',
    // Change this to match your exact folder structure on the server
    basePath: '/projects/LocalCalendar', 
    // assetPrefix ensures CSS/JS chunks load from the right place
    assetPrefix: '/projects/LocalCalendar/',
};

export default nextConfig;
