import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /resume shows the PDF in place (the URL stays /resume), and saving it suggests a clean filename.
  async rewrites() {
    return [{ source: "/resume", destination: "/alara-martin-resume.pdf" }];
  },
  async headers() {
    return [
      {
        source: "/resume",
        headers: [
          { key: "Content-Disposition", value: 'inline; filename="Alara_Martin_Resume.pdf"' },
        ],
      },
    ];
  },
};

export default nextConfig;
