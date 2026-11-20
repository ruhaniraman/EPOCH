import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // The rulebook lives on Google Drive; keep /rulebook working for old links.
        source: "/rulebook",
        destination: "https://drive.google.com/file/d/1705BGEQACEM3ppTnldW5D-cO0VtGWYR5/view?usp=sharing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
