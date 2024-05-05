import netheritePickaxe from "../assets/netherite_pickaxe.png";
import goldenPickaxe from "../assets/golden_pickaxe.png";
import ironPickaxe from "../assets/iron_pickaxe.png";
import stonePickaxe from "../assets/stone_pickaxe.png";
import woodenPickaxe from "../assets/wooden_pickaxe.png";

import { Version, type PackItem } from ".";
import { assertNever } from "../utils";

/** A material a tool is made from. */
type Material = {
  /** The display name (e.g. "Netherite"). */
  displayName: string,
  /** The path to the icon. */
  icon: string,
  /** The Minecraft identifier (e.g. "netherite"). */
  identifier: string,
  /** A description for this tool. */
  description: string,

  allowEnchantments: boolean,
  consumeDurability: "always" | "when_enchanted" | "never",
};

/** A tool that we will generate. */
type Tool = { name: string, damageMultiplier?: number };

/** The list of built-in materials. */
const materials: Material[] = [
  {
    displayName: "Netherite", icon: netheritePickaxe, identifier: "netherite", allowEnchantments: true, consumeDurability: "when_enchanted",
    description: "These tools can be enchanted, but enchanted tools will lose durability when used.",
  },
  {
    displayName: "Golden", icon: goldenPickaxe, identifier: "golden", allowEnchantments: true, consumeDurability: "always",
    description: "These tools can be enchanted. They will always lose durability when used."
  },
  {
    displayName: "Iron", icon: ironPickaxe, identifier: "iron", allowEnchantments: false, consumeDurability: "always",
    description: "These tools will always lose durability when used",
  },
  {
    displayName: "Stone", icon: stonePickaxe, identifier: "stone", allowEnchantments: false, consumeDurability: "always",
    description: "These tools will always lose durability when used",
  },
  {
    displayName: "Wooden", icon: woodenPickaxe, identifier: "wooden", allowEnchantments: false, consumeDurability: "always",
    description: "These tools will always lose durability when used",
  },
]

/** The list of built-in tools. */
const tools: Tool[] = [
  { name: "axe", damageMultiplier: 6 },
  { name: "pickaxe" },
  { name: "hoe" },
  { name: "shovel" },
  { name: "sword", damageMultiplier: 9 },
];

const makeTool = (material: Material): PackItem => ({
  name: `${material.displayName} Tools`,
  description: `Allow ${material.displayName.toLowerCase()} tools to be equipped by turtles. ${material.description}`,
  icon: material.icon,
  iconAlt: `A ${material.displayName} pickaxe`,

  process: (pack) => {
    for (const tool of tools) {
      const name = `${material.identifier}_${tool.name}`;
      const adjective = `upgrade.minecraft.diamond_${tool.name}.adjective`;

      switch (pack.version) {
        case Version.MC_1_20_1:
          // 1.20.1 uses computercraft/turtle_upgrades, and has the adjective as a normal string.
          pack.data("minecraft", `computercraft/turtle_upgrades/${name}.json`, {
            type: "computercraft:tool",
            item: name,
            adjective,
            damageMultiplier: tool.damageMultiplier,
            allowEnchantments: material.allowEnchantments,
            consumeDurability: material.consumeDurability,
          });
          break;

        case Version.MC_1_20_6:
          // 1.20.5 uses computercraft/turtle_upgrade, and has the adjective as a JSON component.
          pack.data("minecraft", `computercraft/turtle_upgrade/${name}.json`, {
            type: "computercraft:tool",
            adjective: { "translate": adjective },
            item: name,
            damageMultiplier: tool.damageMultiplier,
            allowEnchantments: material.allowEnchantments,
            consumeDurability: material.consumeDurability,
          });
          break;
        default:
          assertNever(pack.version);
      }

    }
  },
});

export default materials.map(makeTool);
