import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // "server-only" lança erro fora do bundler do Next — os testes
      // exercitam só as funções puras (mappers) dos módulos que o importam.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
      "@": projectRoot,
    },
  },
});
