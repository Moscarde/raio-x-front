import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagem Docker mínima (sem node_modules inteiro) — ver Dockerfile.
  output: "standalone",
};

export default nextConfig;
