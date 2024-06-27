import { defineConfig, type Plugin } from "vite";
import fs from "fs/promises";
import solidPlugin from "vite-plugin-solid";

const b64Loader: Plugin = {
  name: 'b64-loader',
  transform: async (_code, id) => {
    const [file, query] = id.split('?');
    if (query != "base64") return null;

    const data = await fs.readFile(file);
    return `export default ${JSON.stringify(data.toString("base64"))};`;
  }
};

export default defineConfig({
  base: "",
  plugins: [
    solidPlugin(),
    b64Loader,
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
