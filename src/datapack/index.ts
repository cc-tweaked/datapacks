import JSZip from "jszip";
import { Base64String, assertNever, prettyJson } from "../utils";

export enum Version {
  MC_1_20_1,
  MC_1_20_6,
  MC_1_21,
}

type VersionInfo = Readonly<{
  version: Version,
  label: string,
  resourceVersion: number,
  dataVersion: number,
}>

export const versions: VersionInfo[] = [
  // See https://minecraft.wiki/w/Pack_format for versions.
  { version: Version.MC_1_20_1, label: "1.20.1", resourceVersion: 15, dataVersion: 15 },
  { version: Version.MC_1_20_6, label: "1.20.6", resourceVersion: 32, dataVersion: 41 },
  { version: Version.MC_1_21, label: "1.21", resourceVersion: 34, dataVersion: 48 },
]

/** The contents of a file. */
export type FileContents = string | Blob | Base64String;

const encode = (value: unknown): FileContents => {
  if (typeof value === "string") return value;
  if (value instanceof Blob || value instanceof Base64String) return value;
  return prettyJson(value);
}

const addFile = (zip: JSZip, path: string, contents: FileContents): void => {
  if (typeof contents === "string") {
    zip.file(path, contents);
  } else if (contents instanceof Blob) {
    zip.file(path, contents);
  } else if (contents instanceof Base64String) {
    zip.file(path, contents.contents, { base64: true });
  } else {
    assertNever(contents);
  }
};

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

export const makeModId = (name: string): string => name.toLowerCase()
  .replace(/^[^a-z]+/, "")
  .replaceAll(/[^a-z0-9_]+/g, "_")
  .substring(0, 60);

/**
 * Create a fabric.mod.json file with no entrypoints for our datapack.
 */
const makeFabricModJson = (id: string, name: string): string => prettyJson({
  schemaVersion: 1,
  id,
  version: "1.0.0",
  name,
  license: "CC0-1.0",
  environment: "*",
});

/**
 * Create a mods.toml file using the lowcode system (https://github.com/MinecraftForge/MinecraftForge/pull/8633).
 */
const makeModsToml = (id: string, name: string): string =>
  `modLoader="lowcodefml"
loaderVersion="[1,)"
license="CC0-1.0"
[[mods]]
modId="${id}"
version="1.0.0"
displayName=${prettyJson(name)}`;

/** A builder for data and resource packs. */
export class PackOutput {
  readonly #data = new Map<string, FileContents>();
  readonly #assets = new Map<string, FileContents>();
  readonly #translations = new Set<string>();
  readonly #extraModels = new Set<string>();

  readonly version: Version;
  readonly id: string;
  readonly name: string;

  public constructor(version: Version, name: string, id?: string) {
    this.version = version;
    this.name = name;
    this.id = id ?? makeModId(name);
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

  /** Add an extra model. */
  extraModel(name: string): void {
    this.#extraModels.add(name);
  }

  /** Determine if the datapack has any files. */
  hasData(): boolean { return this.#data.size > 0; }

  /** Determine if the resource pack has any files. */
  hasResources(): boolean { return this.#assets.size > 0 || this.#translations.size > 0 || this.#extraModels.size > 0; }

  private fillDataPack(zip: JSZip) {
    for (const [path, contents] of this.#data.entries()) addFile(zip, path, contents);
  }

  private fillResourcePack(zip: JSZip) {
    for (const [path, contents] of this.#assets.entries()) addFile(zip, path, contents);

    if (this.#extraModels.size > 0) {
      zip.file(`assets/computercraft/extra_models.json`, prettyJson([...this.#extraModels]));
    }
  }

  makeDataPack(): JSZip {
    const zip = newZip(this.name, versions[this.version].dataVersion);
    this.fillDataPack(zip);
    return zip;
  }

  makeResourcePack(): JSZip {
    const zip = newZip(this.name, versions[this.version].resourceVersion);
    this.fillResourcePack(zip);
    return zip;
  }

  makeMod(): JSZip {
    const zip = newZip(this.name, versions[this.version].dataVersion);
    zip.file("META-INF/MANIFEST.MF", "Manifest-Version: 1.0\n")
    this.fillDataPack(zip);
    this.fillResourcePack(zip);

    zip.file("fabric.mod.json", makeFabricModJson(this.id, this.name));
    zip.file(this.version < Version.MC_1_20_6 ? "META-INF/mods.toml" : "META-INF/neoforge.mods.toml", makeModsToml(this.id, this.name));
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

  /** Whether this item is enabled for a specific version. */
  enabled?: (version: Version) => boolean;

  /** Process this datapack. */
  process: (datapack: PackOutput) => void;
};
