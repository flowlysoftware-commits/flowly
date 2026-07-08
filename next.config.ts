import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/flow-companion-webgl/Build/:path*.wasm.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        source: "/flow-companion-webgl/Build/:path*.framework.js.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/flow-companion-webgl/Build/:path*.data.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/octet-stream" },
        ],
      },
      {
        source: "/flow-companion-webgl/Build/:path*.js",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
    ];
  },
};

export default nextConfig;
