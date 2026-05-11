import type { NextConfig } from "next";

const DASHBOARD_URL = "https://happy-water-0ea27651e.7.azurestaticapps.net";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // All UI routes redirect to the new home base.
      // /api/* is NOT redirected — the dashboard still depends on it.
      { source: "/meetings", destination: DASHBOARD_URL, permanent: false },
      { source: "/meetings/:path*", destination: DASHBOARD_URL, permanent: false },
      { source: "/framework", destination: DASHBOARD_URL, permanent: false },
      { source: "/framework/:path*", destination: DASHBOARD_URL, permanent: false },
      { source: "/process/:path*", destination: DASHBOARD_URL, permanent: false },
      { source: "/search", destination: DASHBOARD_URL, permanent: false },
      { source: "/data", destination: DASHBOARD_URL, permanent: false },
    ];
  },
};

export default nextConfig;
