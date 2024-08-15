declare module "*?base64" {
  const src: string
  export default src
}

declare module "virtual:treasure-disks" {
  const contents: import("./datapack/treasure").TreasureDisk[];
  export default contents;
}
