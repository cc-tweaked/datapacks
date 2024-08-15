import { Version, type PackItem } from ".";

import icon from "../assets/treasure.png";

export type TreasureDisk = {
  author: string,
  name: string,
  colour: number,
  files: Record<string, string>,
}

let diskCache: TreasureDisk[] | null = null;

const treasure: PackItem = {
  name: "Treasure Disks",
  description: "Add all of ComputerCraft's old treasure disks.",
  icon,
  iconAlt: "A blue ComputerCraft floppy disk.",
  process: async output => {
    // We store the disks locally to avoid awaits on later actions, which allows the
    // render to be instant.
    const disks = diskCache ?? (diskCache = (await import("virtual:treasure-disks")).default);

    const pool = [];
    for (const { author, name, colour, files } of disks) {
      for (const [file, contents] of Object.entries(files)) {
        output.data("computercraft", `lua/treasure/${author}/${name}/${file}`, contents)
      }

      const title = `${name} by ${author}`;
      const path = `${author}/${name}`;

      pool.push({
        type: "minecraft:item",
        name: "computercraft:treasure_disk",
        functions: [
          output.version >= Version.MC_1_20_6 ? {
            function: "minecraft:set_components",
            components: {
              "computercraft:treasure_disk": { name: title, path },
              "minecraft:dyed_color": { rgb: colour, show_in_tooltip: false }
            }
          } : {
            function: "minecraft:set_nbt",
            tag: JSON.stringify({ "Title": title, "SubPath": path, "Colour": colour })
          }
        ],
      })
    }

    output.data("computercraft", output.version >= Version.MC_1_21 ? "loot_table/treasure_disk.json" : "loot_tables/treasure_disk.json", {
      pools: [{
        name: "main",
        rolls: 1,
        entries: pool,
      }]
    });
  },
};

export default treasure;
