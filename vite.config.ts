import { defineConfig, type Plugin } from "vite";
import fs from "fs/promises";
import path from "path";
import solidPlugin from "vite-plugin-solid";
import { createHash } from "crypto";

const b64Loader: Plugin = {
  name: 'b64-loader',
  transform: async (_code, id) => {
    const [file, query] = id.split('?');
    if (query != "base64") return null;

    const data = await fs.readFile(file);
    return `export default ${JSON.stringify(data.toString("base64"))};`;
  }
};

/**
 * Provides a virtual module that contains the contents of all our treasure disks.
 */
const treasureLoader: Plugin = (() => {
  const virtualModuleId = "virtual:treasure-disks"
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const colours = [
    0x111111, // Black
    0xcc4c4c, // Red
    0x57A64E, // Green
    0x7f664c, // Brown
    0x3366cc, // Blue
    0xb266e5, // Purple
    0x4c99b2, // Cyan
    0x999999, // Light_grey
    0x4c4c4c, // Grey
    0xf2b2cc, // Pink
    0x7fcc19, // Lime
    0xdede6c, // Yellow
    0x99b2f2, // Light_blue
    0xe57fd8, // Magenta
    0xf2b233, // Orange
    0xf0f0f0, // White]
  ]

  return {
    name: "treasure",
    resolveId: (id: string) => id === virtualModuleId ? resolvedVirtualModuleId : undefined,
    async load(id: string) {
      if (id !== resolvedVirtualModuleId) return undefined;

      const treasureRoot = "vendor/treasure-disks";
      const root = "data/computercraft/lua/treasure";

      const disks: import("./src/datapack/treasure").TreasureDisk[] = [];

      // Read all programs from the treasure-disks repo
      for (const author of await fs.readdir(path.join(treasureRoot, root))) {
        if (author === "deprecated") continue;

        for (const name of await fs.readdir(path.join(treasureRoot, root, author))) {
          // Generate a colour from the author + name.
          const hash = createHash("md5");
          hash.update(`${author}/${name}`);
          const digest = hash.digest();
          const colour = colours[(digest[0] >> 4) & 0xf];

          // Walk the file tree to find the contents.
          const files: Record<string, string> = {};
          const programDir = path.join(treasureRoot, root, author, name);
          for (const child of await fs.readdir(programDir, { recursive: true, withFileTypes: true })) {
            if (!child.isFile()) continue;

            const childPath = path.join(child.parentPath, child.name);
            files[path.relative(programDir, childPath)] = await fs.readFile(childPath, { encoding: "utf-8" });
          }

          disks.push({ author, name, colour, files });
        }
      }

      // Then save as one massive JS file.
      return `export default ${JSON.stringify(disks)};`
    },
  }
})();

export default defineConfig({
  base: "",
  plugins: [
    solidPlugin(),
    b64Loader,
    treasureLoader,
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
