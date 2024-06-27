import { Version, type FileContents, type PackItem, type PackOutput } from ".";
import { Base64String } from "../utils";

import aceFlag from "../assets/ace_flag.png?base64";
import bisexualFlag from "../assets/bisexual_flag.png?base64";
import icon from "../assets/flags.png";
import nbFlag from "../assets/nb_flag.png?base64";

type Overlay = {
  /// The id of this turtle overlay
  id: string,
  /** The height of the flag. */
  modelHeight: number, // TODO: A nicer interface for models and textures.
  /** The contents of the texture. */
  texture: FileContents,
  /** Whether to show the elf overlay. */
  showElfOverlay?: boolean,
  /** Ingredients used to craft this overlay. */
  ingredients: Ingredient[]
};

type Ingredient = { tag: string } | { item: string };

const turtleFamilies = ["normal", "advanced"];

const makeModel = (texture: string, height: number): unknown => ({
  parent: "block/block",
  textures: {
    particle: texture,
    texture: texture
  },
  elements: [
    {
      name: "Flag",
      from: [1.5, 13.5, 10.5],
      to: [2, 13.5 + (height / 2), 15.5],
      rotation: { angle: 22.5, axis: "x", origin: [2, 11, 10.75] },
      faces: {
        north: { uv: [0, 0, 1, height], texture: "#texture" },
        east: { uv: [0, 0, 7, height], texture: "#texture" },
        south: { uv: [0, 0, 1, height], texture: "#texture" },
        west: { uv: [0, 0, 7, height], texture: "#texture" },
        up: { uv: [10, 0, 11, height], texture: "#texture" },
        down: { uv: [8, 0, 9, height], texture: "#texture" }
      }
    },
    {
      name: "Stick",
      from: [1.5, 10.5, 10.5],
      to: [2, 13.5, 11],
      rotation: { angle: 22.5, axis: "x", origin: [2, 11, 10.75] },
      faces: {
        north: { uv: [12, 0, 13, 6], texture: "#texture" },
        east: { uv: [13, 0, 14, 6], texture: "#texture" },
        south: { uv: [12, 0, 13, 6], texture: "#texture" },
        west: { uv: [13, 0, 14, 6], texture: "#texture" },
        up: { uv: [12, 6, 13, 7], texture: "#texture" },
        down: { uv: [13, 6, 14, 7], texture: "#texture" }
      }
    }
  ]
});

const addOverlay = (output: PackOutput, { id, modelHeight, texture, showElfOverlay, ingredients }: Overlay) => {
  const modelPath = `block/turtle_overlay_${id}`;
  const modelId = `${output.id}:${modelPath}`;

  output.extraModel(modelId);
  output.data(output.id, `computercraft/turtle_overlay/${id}.json`, { model: modelId, show_elf_overlay: showElfOverlay });
  output.resource(output.id, `models/${modelPath}.json`, makeModel(modelId, modelHeight));
  output.resource(output.id, `textures/${modelPath}.png`, texture);

  for (const family of turtleFamilies) {
    output.data(output.id, `recipe/turtle_${family}_overlays/${id}.json`, {
      type: "computercraft:transform_shapeless",
      category: "redstone",
      function: [
        {
          type: "computercraft:copy_components",
          exclude: ["computercraft:overlay"],
          from: { item: `computercraft:turtle_${family}` }
        }
      ],
      group: `computercraft:turtle_${family}_overlay`,
      ingredients: [
        ...ingredients,
        { item: `computercraft:turtle_${family}` }
      ],
      result: {
        components: { "computercraft:overlay": `${output.id}:${id}` },
        count: 1,
        id: `computercraft:turtle_${family}`
      }
    })
  }
}

const makeOverlays = (overlays: Overlay[]) => (output: PackOutput): void => {
  for (const overlay of overlays) addOverlay(output, overlay);
}

export const turtleFlags: PackItem = {
  name: "More Turtle Flags",
  description: "Add extra flags for turtles to hold.",
  icon,
  iconAlt: "A Non-Binary and Bisexual flag crossed.",
  enabled: version => version >= Version.MC_1_21,
  process: makeOverlays([
    {
      id: "ace_flag",
      showElfOverlay: true,
      modelHeight: 4,
      texture: new Base64String(aceFlag),
      ingredients: [
        { item: "minecraft:stick" },
        { item: "minecraft:black_dye" },
        { item: "minecraft:light_gray_dye" },
        { item: "minecraft:white_dye" },
        { item: "minecraft:purple_dye" },
      ],
    },
    {
      id: "bisexual_flag",
      showElfOverlay: true,
      modelHeight: 5,
      texture: new Base64String(bisexualFlag),
      ingredients: [
        { item: "minecraft:stick" },
        { item: "minecraft:purple_dye" },
        { item: "minecraft:magenta_dye" },
        { item: "minecraft:blue_dye" },
      ],
    },
    {
      id: "non_binary_flag",
      showElfOverlay: true,
      modelHeight: 4,
      texture: new Base64String(nbFlag),
      ingredients: [
        { item: "minecraft:stick" },
        { item: "minecraft:yellow_dye" },
        { item: "minecraft:white_dye" },
        { item: "minecraft:purple_dye" },
        { item: "minecraft:black_dye" },
      ],
    },
  ]),
};
