import type { PackItem } from ".";
import turtleLever from "../assets/turtle_lever.png";
import turtleModem from "../assets/turtle_modem.png";

const make = (pack: Omit<PackItem, "process">, entries: string[]): PackItem => ({
  ...pack,
  process: (pack) => pack.blockTags.add("computercraft:turtle_can_use", entries),
});

export default [
  make({
    name: "Turtles ❤ Levers",
    description: "Allow turtle.place() to flip levers and press buttons.",
    icon: turtleLever,
    iconAlt: "A picture of a turtle next to a lever."
  }, [
    "minecraft:lever",
    "#minecraft:buttons"
  ]),
  make({
    name: "Turtles ❤ Modems",
    description: "Allow turtle.place() to activate wired modems.",
    icon: turtleModem,
    iconAlt: "A picture of a turtle next to a wired modem."
  }, [
    "#computercraft:wired_modem"
  ]),
];
