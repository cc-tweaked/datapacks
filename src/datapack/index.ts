import JSZip from "jszip";
import { prettyJson } from "../utils";

export enum Version {
  MC_1_20_1,
  MC_1_20_6,
}

type VersionInfo = Readonly<{
  version: Version,
  label: string,
  resourceVersion: number,
  dataVersion: number,
}>

export const versions: VersionInfo[] = [
  { version: Version.MC_1_20_1, label: "1.20.1", resourceVersion: 15, dataVersion: 15 },
  { version: Version.MC_1_20_6, label: "1.20.6", resourceVersion: 32, dataVersion: 41 },
]

const encode = (value: unknown): string | Blob => {
  if (typeof value === "string") return value;
  if (value instanceof Blob) return value;
  return prettyJson(value);
}

const newZip = (name: string, version: number): JSZip => {
  const zip = new JSZip();
  zip.file("pack.mcmeta", prettyJson({
    pack: {
      pack_format: version,
      description: name
    },
  }));
  return zip;
}

const makeModId = (name: string): string => name.toLowerCase()
  .replace(/^[^a-z]+/, "")
  .replaceAll(/[^a-z0-9_]+/g, "_")
  .substring(0, 60);

/**
 * Create a fabric.mod.json file with no entrypoints for our datapack.
 */
const makeFabricModJson = (name: string): string => prettyJson({
  schemaVersion: 1,
  id: makeModId(name),
  version: "1.0.0",
  name: name,
  license: "CC0-1.0",
  environment: "*",
});

/**
 * Create a mods.toml file using the lowcode system (https://github.com/MinecraftForge/MinecraftForge/pull/8633).
 */
const makeModsToml = (name: string): string =>
`modLoader="lowcodefml"
loaderVersion="[1,)"
license="CC0-1.0"
[[mods]]
modId="${makeModId(name)}"
version="1.0.0"
displayName=${prettyJson(name)}`;

/** A builder for data and resource packs. */
export class PackOutput {
  readonly #data = new Map<string, string | Blob>();
  readonly #assets = new Map<string, string | Blob>();
  readonly #translations = new Set<string>();

  readonly version: Version;

  public constructor(version: Version) {
    this.version = version;
  }

  /** Add a datapack entry. */
  data(namespace: string, path: string, contents: unknown): void {
    if (path.startsWith("/")) throw Error("Invalid path");

    const fullPath = `data/${namespace}/${path}`;
    if (this.#data.has(fullPath)) throw Error(`Duplicate path "${fullPath}"`);

    this.#data.set(fullPath, encode(contents));
  }

  /** Add a resource pack entry. */
  resource(namespace: string, path: string, contents: unknown): void {
    if (path.startsWith("/")) throw Error("Invalid path");

    const fullPath = `assets/${namespace}/${path}`;
    if (this.#data.has(fullPath)) throw Error(`Duplicate path "${fullPath}"`);

    this.#data.set(fullPath, encode(contents));
  }

  /** Add a translation key. */
  translation(name: string): void {
    this.#translations.add(name);
  }

  /** Determine if the datapack has any files. */
  hasData(): boolean { return this.#data.size > 0; }

  /** Determine if the resource pack has any files. */
  hasResources(): boolean { return this.#assets.size > 0 || this.#translations.size > 0; }

  makeDataPack(name: string): JSZip {
    const zip = newZip(name, versions[this.version].dataVersion);
    for (const [path, contents] of this.#data.entries()) zip.file<"string" | "blob">(path, contents);
    return zip;
  }

  makeMod(name: string): JSZip {
    const zip = newZip(name, versions[this.version].dataVersion);
    for (const [path, contents] of this.#data.entries()) zip.file<"string" | "blob">(path, contents);

    zip.file("fabric.mod.json", makeFabricModJson(name));
    zip.file(this.version < Version.MC_1_20_6 ? "META-INF/mods.toml" : "META-INF/neoforge.mods.toml", makeModsToml(name));
    return zip;
  }
}

export type PackItem = {
  /** The display name (e.g. "Netherite"). */
  name: string,
  /** A more detailed description of this pack item. */
  description: string,
  /** The path to the icon. */
  icon: string,
  /** Alt text for the feature icon.  */
  iconAlt: string,

  process: (datapack: PackOutput) => void;
};
